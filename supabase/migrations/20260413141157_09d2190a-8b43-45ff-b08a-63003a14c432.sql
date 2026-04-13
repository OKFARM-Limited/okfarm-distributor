
-- Drop the overly permissive policy
DROP POLICY "Trigger can insert audit_logs" ON public.audit_logs;

-- The audit_log_trigger function uses SECURITY DEFINER so it bypasses RLS.
-- No additional INSERT policy is needed for the trigger to work.
