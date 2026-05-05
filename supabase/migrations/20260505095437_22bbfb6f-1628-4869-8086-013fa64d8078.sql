
-- 1. Attach allocation stock-deduction trigger
DROP TRIGGER IF EXISTS trg_adjust_stock_on_allocation ON public.allocation_items;
CREATE TRIGGER trg_adjust_stock_on_allocation
AFTER INSERT ON public.allocation_items
FOR EACH ROW
EXECUTE FUNCTION public.adjust_stock_on_allocation();

-- 2. Function to return unsold stock (returns + spoilage) back to stock_levels
CREATE OR REPLACE FUNCTION public.adjust_stock_on_reconciliation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE stock_levels sl
    SET current_stock = sl.current_stock + (ri.returned_qty + ri.spoilage_qty),
        updated_at = now()
    FROM reconciliation_items ri
    WHERE ri.reconciliation_id = NEW.id
      AND sl.product_id = ri.product_id
      AND sl.outlet_id = NEW.outlet_id
      AND (ri.returned_qty + ri.spoilage_qty) > 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_adjust_stock_on_reconciliation ON public.reconciliations;
CREATE TRIGGER trg_adjust_stock_on_reconciliation
AFTER INSERT OR UPDATE ON public.reconciliations
FOR EACH ROW
EXECUTE FUNCTION public.adjust_stock_on_reconciliation();

-- 3. Attach delivery stock-in trigger (function exists, no trigger)
DROP TRIGGER IF EXISTS trg_adjust_stock_on_delivery ON public.inbound_deliveries;
CREATE TRIGGER trg_adjust_stock_on_delivery
AFTER INSERT OR UPDATE ON public.inbound_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.adjust_stock_on_delivery();

-- 4. Attach low-stock notification trigger
DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.stock_levels;
CREATE TRIGGER trg_notify_low_stock
AFTER UPDATE ON public.stock_levels
FOR EACH ROW
EXECUTE FUNCTION public.notify_low_stock();
