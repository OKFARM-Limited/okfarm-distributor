-- =============================================
-- REMEDIATION: Phase 1 + Phase 2
-- Transactional RPC functions & vendor code generator
-- =============================================

-- 1. Transactional sale creation (parent + items in one transaction)
CREATE OR REPLACE FUNCTION public.create_sale_with_items(
  p_vendor_id uuid,
  p_outlet_id uuid,
  p_date date,
  p_total_value numeric,
  p_amount_paid numeric,
  p_outstanding numeric,
  p_payment_method text,
  p_items jsonb  -- array of {product_id, quantity, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
BEGIN
  INSERT INTO sales (vendor_id, outlet_id, date, total_value, amount_paid, outstanding, payment_method)
  VALUES (p_vendor_id, p_outlet_id, p_date, p_total_value, p_amount_paid, p_outstanding, p_payment_method)
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
  SELECT v_sale_id,
         (item->>'product_id')::uuid,
         (item->>'quantity')::int,
         (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_sale_id;
END;
$$;

-- 2. Transactional allocation creation (parent + items in one transaction)
CREATE OR REPLACE FUNCTION public.create_allocation_with_items(
  p_vendor_id uuid,
  p_outlet_id uuid,
  p_date date,
  p_total_value numeric,
  p_status text,
  p_notes text,
  p_items jsonb  -- array of {product_id, quantity, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alloc_id uuid;
BEGIN
  INSERT INTO allocations (vendor_id, outlet_id, date, total_value, status, notes)
  VALUES (p_vendor_id, p_outlet_id, p_date, p_total_value, p_status, p_notes)
  RETURNING id INTO v_alloc_id;

  INSERT INTO allocation_items (allocation_id, product_id, quantity, unit_price)
  SELECT v_alloc_id,
         (item->>'product_id')::uuid,
         (item->>'quantity')::int,
         (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_alloc_id;
END;
$$;

-- 3. Server-side sequential vendor code generator
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq int;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(vendor_code FROM 5)::int), 0) + 1
  INTO v_seq
  FROM vendors
  WHERE vendor_code ~ '^VND-\d+$';

  RETURN 'VND-' || LPAD(v_seq::text, 5, '0');
END;
$$;
