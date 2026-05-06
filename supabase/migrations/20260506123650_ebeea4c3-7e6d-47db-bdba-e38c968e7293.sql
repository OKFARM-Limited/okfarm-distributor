CREATE OR REPLACE FUNCTION public.recalculate_stock(p_outlet_id uuid DEFAULT NULL, p_apply boolean DEFAULT false)
RETURNS TABLE (
  product_id uuid,
  outlet_id uuid,
  product_name text,
  outlet_name text,
  current_stock integer,
  expected_stock integer,
  variance integer,
  applied boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin'::app_role) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can recalculate stock';
  END IF;

  RETURN QUERY
  WITH deliv AS (
    SELECT di.product_id, d.outlet_id, COALESCE(SUM(di.quantity),0)::int AS qty
    FROM delivery_items di
    JOIN inbound_deliveries d ON d.id = di.delivery_id
    WHERE d.status = 'received'
      AND (p_outlet_id IS NULL OR d.outlet_id = p_outlet_id)
    GROUP BY di.product_id, d.outlet_id
  ),
  alloc AS (
    SELECT ai.product_id, a.outlet_id, COALESCE(SUM(ai.quantity),0)::int AS qty
    FROM allocation_items ai
    JOIN allocations a ON a.id = ai.allocation_id
    WHERE (p_outlet_id IS NULL OR a.outlet_id = p_outlet_id)
    GROUP BY ai.product_id, a.outlet_id
  ),
  sold AS (
    SELECT si.product_id, s.outlet_id, COALESCE(SUM(si.quantity),0)::int AS qty
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE (p_outlet_id IS NULL OR s.outlet_id = p_outlet_id)
    GROUP BY si.product_id, s.outlet_id
  ),
  recon AS (
    SELECT ri.product_id, r.outlet_id, COALESCE(SUM(ri.returned_qty + ri.spoilage_qty),0)::int AS qty
    FROM reconciliation_items ri
    JOIN reconciliations r ON r.id = ri.reconciliation_id
    WHERE r.status = 'completed'
      AND (p_outlet_id IS NULL OR r.outlet_id = p_outlet_id)
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
    SELECT
      c.product_id,
      c.outlet_id,
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
    SELECT m.product_id, m.outlet_id, m.expected_stock
    FROM mismatched m
    WHERE p_apply = true
    ON CONFLICT (product_id, outlet_id) DO UPDATE
      SET current_stock = EXCLUDED.current_stock, updated_at = now()
    RETURNING stock_levels.product_id, stock_levels.outlet_id
  ),
  logged AS (
    INSERT INTO audit_logs (action, entity_type, entity_id, details, user_id)
    SELECT
      'RECALC stock_levels',
      'stock_levels',
      m.product_id::text,
      'Outlet ' || COALESCE(m.outlet_id::text,'(none)') || ': ' || m.current_stock || ' → ' || m.expected_stock || ' (variance ' || (m.expected_stock - m.current_stock) || ')',
      auth.uid()
    FROM mismatched m
    WHERE p_apply = true
    RETURNING 1
  )
  SELECT
    m.product_id,
    m.outlet_id,
    p.name,
    o.name,
    m.current_stock,
    m.expected_stock,
    (m.expected_stock - m.current_stock)::int,
    p_apply
  FROM mismatched m
  LEFT JOIN products p ON p.id = m.product_id
  LEFT JOIN outlets  o ON o.id = m.outlet_id
  ORDER BY abs(m.expected_stock - m.current_stock) DESC;
END;
$$;

-- Ensure stock_levels has a unique constraint for ON CONFLICT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='stock_levels' AND indexname='stock_levels_product_outlet_uniq'
  ) THEN
    CREATE UNIQUE INDEX stock_levels_product_outlet_uniq ON public.stock_levels (product_id, outlet_id);
  END IF;
END $$;