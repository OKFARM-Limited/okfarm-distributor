-- Migration to resolve PL/pgSQL variable conflict in recalculate_stock function
-- Adds #variable_conflict use_column directive to avoid ambiguity between 
-- the RETURNS TABLE columns (product_id, outlet_id) and table/CTE columns.

CREATE OR REPLACE FUNCTION public.recalculate_stock(
  p_outlet_id uuid DEFAULT NULL,
  p_apply boolean DEFAULT false,
  p_threshold integer DEFAULT NULL
)
RETURNS TABLE(
  product_id uuid, outlet_id uuid, product_name text, outlet_name text,
  current_stock integer, expected_stock integer, variance integer, applied boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_is_admin boolean;
  v_threshold integer;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin'::app_role) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can recalculate stock';
  END IF;

  -- Resolve threshold: explicit param overrides app_settings (default 10)
  IF p_threshold IS NOT NULL THEN
    v_threshold := p_threshold;
  ELSE
    SELECT COALESCE((value)::text::integer, 10) INTO v_threshold
    FROM app_settings WHERE key = 'stock_recalc_threshold';
    v_threshold := COALESCE(v_threshold, 10);
  END IF;

  RETURN QUERY
  WITH deliv AS (
    SELECT di.product_id, d.outlet_id, COALESCE(SUM(di.quantity),0)::int AS qty
    FROM delivery_items di JOIN inbound_deliveries d ON d.id = di.delivery_id
    WHERE d.status = 'received' AND (p_outlet_id IS NULL OR d.outlet_id = p_outlet_id)
    GROUP BY di.product_id, d.outlet_id
  ),
  alloc AS (
    SELECT ai.product_id, a.outlet_id, COALESCE(SUM(ai.quantity),0)::int AS qty
    FROM allocation_items ai JOIN allocations a ON a.id = ai.allocation_id
    WHERE (p_outlet_id IS NULL OR a.outlet_id = p_outlet_id)
    GROUP BY ai.product_id, a.outlet_id
  ),
  sold AS (
    SELECT si.product_id, s.outlet_id, COALESCE(SUM(si.quantity),0)::int AS qty
    FROM sale_items si JOIN sales s ON s.id = si.sale_id
    WHERE (p_outlet_id IS NULL OR s.outlet_id = p_outlet_id)
    GROUP BY si.product_id, s.outlet_id
  ),
  recon AS (
    SELECT ri.product_id, r.outlet_id, COALESCE(SUM(ri.returned_qty + ri.spoilage_qty),0)::int AS qty
    FROM reconciliation_items ri JOIN reconciliations r ON r.id = ri.reconciliation_id
    WHERE r.status = 'completed' AND (p_outlet_id IS NULL OR r.outlet_id = p_outlet_id)
    GROUP BY ri.product_id, r.outlet_id
  ),
  combined AS (
    SELECT d.product_id, d.outlet_id FROM deliv d
    UNION SELECT a.product_id, a.outlet_id FROM alloc a
    UNION SELECT s.product_id, s.outlet_id FROM sold s
    UNION SELECT r.product_id, r.outlet_id FROM recon r
    UNION SELECT sl.product_id, sl.outlet_id FROM stock_levels sl
      WHERE (p_outlet_id IS NULL OR sl.outlet_id = p_outlet_id)
  ),
  diff AS (
    SELECT
      c.product_id,
      c.outlet_id,
      COALESCE(sl.current_stock, 0)::int AS current_stock,
      (COALESCE(d.qty,0) - COALESCE(a.qty,0) - COALESCE(s.qty,0) + COALESCE(r.qty,0))::int AS expected_stock
    FROM combined c
    LEFT JOIN deliv  d ON d.product_id = c.product_id AND d.outlet_id IS NOT DISTINCT FROM c.outlet_id
    LEFT JOIN alloc  a ON a.product_id = c.product_id AND a.outlet_id IS NOT DISTINCT FROM c.outlet_id
    LEFT JOIN sold   s ON s.product_id = c.product_id AND s.outlet_id IS NOT DISTINCT FROM c.outlet_id
    LEFT JOIN recon  r ON r.product_id = c.product_id AND r.outlet_id IS NOT DISTINCT FROM c.outlet_id
    LEFT JOIN stock_levels sl ON sl.product_id = c.product_id AND sl.outlet_id IS NOT DISTINCT FROM c.outlet_id
  ),
  mismatched AS (
    SELECT
      diff.product_id,
      diff.outlet_id,
      diff.current_stock,
      diff.expected_stock
    FROM diff
    WHERE diff.expected_stock <> diff.current_stock
  ),
  applied_rows AS (
    INSERT INTO stock_levels (product_id, outlet_id, current_stock)
    SELECT m.product_id, m.outlet_id, m.expected_stock FROM mismatched m
    WHERE p_apply = true
    ON CONFLICT (product_id, outlet_id) DO UPDATE
      SET current_stock = EXCLUDED.current_stock, updated_at = now()
    RETURNING stock_levels.product_id, stock_levels.outlet_id
  ),
  logged AS (
    INSERT INTO audit_logs (action, entity_type, entity_id, details, user_id)
    SELECT 'RECALC stock_levels', 'stock_levels', m.product_id::text,
      'Outlet ' || COALESCE(m.outlet_id::text,'(none)') || ': ' || m.current_stock || ' → ' || m.expected_stock || ' (variance ' || (m.expected_stock - m.current_stock) || ')',
      auth.uid()
    FROM mismatched m WHERE p_apply = true
    RETURNING 1
  ),
  notified AS (
    INSERT INTO notifications (title, message, type, priority, outlet_id, action_url)
    SELECT
      'Stock Variance Detected',
      'Product ' || COALESCE(p.name, m.product_id::text) ||
        ' at ' || COALESCE(o.name, 'unknown outlet') ||
        ': current ' || m.current_stock || ', expected ' || m.expected_stock ||
        ' (variance ' || (m.expected_stock - m.current_stock) || ', threshold ' || v_threshold || ')',
      'low_stock', 'high', m.outlet_id, '/stock-recalc'
    FROM mismatched m
    LEFT JOIN products p ON p.id = m.product_id
    LEFT JOIN outlets  o ON o.id = m.outlet_id
    WHERE abs(m.expected_stock - m.current_stock) >= v_threshold
    RETURNING 1
  )
  SELECT
    m.product_id,
    m.outlet_id,
    p.name AS product_name,
    o.name AS outlet_name,
    m.current_stock,
    m.expected_stock,
    (m.expected_stock - m.current_stock)::int AS variance,
    p_apply AS applied
  FROM mismatched m
  LEFT JOIN products p ON p.id = m.product_id
  LEFT JOIN outlets  o ON o.id = m.outlet_id
  ORDER BY abs(m.expected_stock - m.current_stock) DESC;
END;
$function$;
