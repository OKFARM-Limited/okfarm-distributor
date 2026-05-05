CREATE OR REPLACE FUNCTION public.adjust_stock_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_outlet_id uuid;
BEGIN
  SELECT outlet_id INTO v_outlet_id FROM sales WHERE id = NEW.sale_id;
  UPDATE stock_levels
  SET current_stock = current_stock - NEW.quantity,
      updated_at = now()
  WHERE product_id = NEW.product_id
    AND outlet_id = v_outlet_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_adjust_stock_on_sale ON public.sale_items;
CREATE TRIGGER trg_adjust_stock_on_sale
AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.adjust_stock_on_sale();

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;