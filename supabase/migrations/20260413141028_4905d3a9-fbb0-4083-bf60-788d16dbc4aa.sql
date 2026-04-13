
-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
  VALUES (
    TG_OP || ' ' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    'Auto-logged ' || lower(TG_OP),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers to core tables
CREATE TRIGGER audit_vendors AFTER INSERT OR UPDATE OR DELETE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_sales AFTER INSERT OR UPDATE OR DELETE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_allocations AFTER INSERT OR UPDATE OR DELETE ON public.allocations FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_stock_levels AFTER INSERT OR UPDATE OR DELETE ON public.stock_levels FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_check_ins AFTER INSERT OR UPDATE OR DELETE ON public.check_ins FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_inbound_deliveries AFTER INSERT OR UPDATE OR DELETE ON public.inbound_deliveries FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Allow the trigger to insert audit logs for any authenticated user
CREATE POLICY "Trigger can insert audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
