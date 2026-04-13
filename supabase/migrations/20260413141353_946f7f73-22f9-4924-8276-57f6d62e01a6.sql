
-- Function to create low-stock notifications
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_product_name text;
BEGIN
  -- Only fire when current_stock drops below min_stock and it wasn't already below
  IF NEW.current_stock < NEW.min_stock
     AND (OLD.current_stock IS NULL OR OLD.current_stock >= OLD.min_stock) THEN

    SELECT name INTO v_product_name FROM products WHERE id = NEW.product_id;

    INSERT INTO notifications (title, message, type, priority, outlet_id, action_url)
    VALUES (
      'Low Stock Alert',
      coalesce(v_product_name, 'Unknown product') || ' is at ' || NEW.current_stock || ' units (min: ' || NEW.min_stock || ')',
      'stock',
      'high',
      NEW.outlet_id,
      '/inventory'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_low_stock
AFTER INSERT OR UPDATE ON public.stock_levels
FOR EACH ROW
EXECUTE FUNCTION public.notify_low_stock();

-- Function to create overdue-payment notifications
CREATE OR REPLACE FUNCTION public.notify_overdue_deliveries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_rec RECORD;
BEGIN
  FOR v_rec IN
    SELECT id, invoice_number, due_date, total_value, outlet_id
    FROM inbound_deliveries
    WHERE status = 'received'
      AND due_date < CURRENT_DATE
      AND id NOT IN (
        SELECT entity_id::uuid FROM notifications
        WHERE type = 'payment' AND title = 'Overdue Payment'
      )
  LOOP
    INSERT INTO notifications (title, message, type, priority, outlet_id, action_url)
    VALUES (
      'Overdue Payment',
      'Invoice ' || v_rec.invoice_number || ' (GHS ' || v_rec.total_value || ') was due on ' || v_rec.due_date,
      'payment',
      'high',
      v_rec.outlet_id,
      '/settlement'
    );
  END LOOP;
END;
$$;
