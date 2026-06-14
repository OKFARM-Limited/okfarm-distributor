-- =============================================
-- REMEDIATION: Phase 3
-- Transactional RPC functions for reconciliations,
-- orders, deliveries, and settlements
-- =============================================

-- 1. Transactional reconciliation creation
--    Also marks the parent allocation as 'reconciled'
CREATE OR REPLACE FUNCTION public.create_reconciliation_with_items(
  p_allocation_id uuid,
  p_vendor_id uuid,
  p_outlet_id uuid,
  p_date date,
  p_total_returned int,
  p_total_spoilage int,
  p_total_sold int,
  p_cash_collected numeric,
  p_status text,
  p_notes text,
  p_items jsonb  -- array of {product_id, allocated_qty, returned_qty, spoilage_qty, sold_qty, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recon_id uuid;
BEGIN
  INSERT INTO reconciliations (allocation_id, vendor_id, outlet_id, date, total_returned, total_spoilage, total_sold, cash_collected, status, notes)
  VALUES (p_allocation_id, p_vendor_id, p_outlet_id, p_date, p_total_returned, p_total_spoilage, p_total_sold, p_cash_collected, p_status, p_notes)
  RETURNING id INTO v_recon_id;

  INSERT INTO reconciliation_items (reconciliation_id, product_id, allocated_qty, returned_qty, spoilage_qty, sold_qty, unit_price)
  SELECT v_recon_id,
         (item->>'product_id')::uuid,
         COALESCE((item->>'allocated_qty')::int, 0),
         COALESCE((item->>'returned_qty')::int, 0),
         COALESCE((item->>'spoilage_qty')::int, 0),
         COALESCE((item->>'sold_qty')::int, 0),
         COALESCE((item->>'unit_price')::numeric, 0)
  FROM jsonb_array_elements(p_items) AS item;

  -- Mark the allocation as reconciled
  UPDATE allocations SET status = 'reconciled' WHERE id = p_allocation_id;

  RETURN v_recon_id;
END;
$$;

-- 2. Transactional order creation
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_outlet_id uuid,
  p_status text,
  p_order_date date,
  p_expected_delivery date,
  p_total_value numeric,
  p_notes text,
  p_items jsonb  -- array of {product_id, quantity, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  INSERT INTO orders (outlet_id, status, order_date, expected_delivery, total_value, notes)
  VALUES (p_outlet_id, p_status, p_order_date, p_expected_delivery, p_total_value, p_notes)
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT v_order_id,
         (item->>'product_id')::uuid,
         (item->>'quantity')::int,
         (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_order_id;
END;
$$;

-- 3. Transactional delivery creation
CREATE OR REPLACE FUNCTION public.create_delivery_with_items(
  p_outlet_id uuid,
  p_invoice_number text,
  p_supplier text,
  p_date date,
  p_due_date date,
  p_credit_term_days int,
  p_total_value numeric,
  p_status text,
  p_received_by text,
  p_notes text,
  p_items jsonb  -- array of {product_id, quantity, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery_id uuid;
BEGIN
  INSERT INTO inbound_deliveries (outlet_id, invoice_number, supplier, date, due_date, credit_term_days, total_value, status, received_by, notes)
  VALUES (p_outlet_id, p_invoice_number, p_supplier, p_date, p_due_date, p_credit_term_days, p_total_value, p_status, p_received_by, p_notes)
  RETURNING id INTO v_delivery_id;

  INSERT INTO delivery_items (delivery_id, product_id, quantity, unit_price)
  SELECT v_delivery_id,
         (item->>'product_id')::uuid,
         (item->>'quantity')::int,
         (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_delivery_id;
END;
$$;

-- 4. Transactional settlement creation
CREATE OR REPLACE FUNCTION public.create_settlement_with_lines(
  p_outlet_id uuid,
  p_month text,
  p_total_receivable numeric,
  p_total_paid numeric,
  p_discount numeric,
  p_discount_rate numeric,
  p_net_payable numeric,
  p_status text,
  p_notes text,
  p_lines jsonb  -- array of {invoice_number, date, amount, credit_days, due_date, amount_paid, status}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settlement_id uuid;
BEGIN
  INSERT INTO settlements (outlet_id, month, total_receivable, total_paid, discount, discount_rate, net_payable, status, notes)
  VALUES (p_outlet_id, p_month, p_total_receivable, p_total_paid, p_discount, p_discount_rate, p_net_payable, p_status, p_notes)
  RETURNING id INTO v_settlement_id;

  INSERT INTO settlement_lines (settlement_id, invoice_number, date, amount, credit_days, due_date, amount_paid, status)
  SELECT v_settlement_id,
         item->>'invoice_number',
         (item->>'date')::date,
         COALESCE((item->>'amount')::numeric, 0),
         COALESCE((item->>'credit_days')::int, 30),
         (item->>'due_date')::date,
         COALESCE((item->>'amount_paid')::numeric, 0),
         COALESCE(item->>'status', 'due')
  FROM jsonb_array_elements(p_lines) AS item;

  RETURN v_settlement_id;
END;
$$;
