
-- 1. app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view app_settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage app_settings"
  ON public.app_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.app_settings (key, value)
VALUES ('stock_recalc_threshold', '10'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Updated recalculate_stock with threshold + notifications
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
    SELECT product_id, outlet_id FROM deliv
    UNION SELECT product_id, outlet_id FROM alloc
    UNION SELECT product_id, outlet_id FROM sold
    UNION SELECT product_id, outlet_id FROM recon
    UNION SELECT sl.product_id, sl.outlet_id FROM stock_levels sl
      WHERE (p_outlet_id IS NULL OR sl.outlet_id = p_outlet_id)
  ),
  diff AS (
    SELECT c.product_id, c.outlet_id,
      COALESCE(sl.current_stock, 0)::int AS current_stock,
      (COALESCE(d.qty,0) - COALESCE(a.qty,0) - COALESCE(s.qty,0) + COALESCE(r.qty,0))::int AS expected_stock
    FROM combined c
    LEFT JOIN deliv d USING (product_id, outlet_id)
    LEFT JOIN alloc a USING (product_id, outlet_id)
    LEFT JOIN sold  s USING (product_id, outlet_id)
    LEFT JOIN recon r USING (product_id, outlet_id)
    LEFT JOIN stock_levels sl ON sl.product_id = c.product_id AND sl.outlet_id IS NOT DISTINCT FROM c.outlet_id
  ),
  mismatched AS (
    SELECT * FROM diff WHERE expected_stock <> current_stock
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
  SELECT m.product_id, m.outlet_id, p.name, o.name,
    m.current_stock, m.expected_stock,
    (m.expected_stock - m.current_stock)::int, p_apply
  FROM mismatched m
  LEFT JOIN products p ON p.id = m.product_id
  LEFT JOIN outlets  o ON o.id = m.outlet_id
  ORDER BY abs(m.expected_stock - m.current_stock) DESC;
END;
$function$;
