
CREATE OR REPLACE FUNCTION public.notify_overdue_deliveries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_rec RECORD;
  v_exists boolean;
BEGIN
  FOR v_rec IN
    SELECT id, invoice_number, due_date, total_value, outlet_id
    FROM inbound_deliveries
    WHERE status = 'received'
      AND due_date < CURRENT_DATE
  LOOP
    -- Check if we already sent a notification for this invoice
    SELECT EXISTS (
      SELECT 1 FROM notifications
      WHERE type = 'payment'
        AND title = 'Overdue Payment'
        AND message LIKE '%' || v_rec.invoice_number || '%'
    ) INTO v_exists;

    IF NOT v_exists THEN
      INSERT INTO notifications (title, message, type, priority, outlet_id, action_url)
      VALUES (
        'Overdue Payment',
        'Invoice ' || v_rec.invoice_number || ' (GHS ' || v_rec.total_value || ') was due on ' || v_rec.due_date,
        'payment',
        'high',
        v_rec.outlet_id,
        '/settlement'
      );
    END IF;
  END LOOP;
END;
$$;
