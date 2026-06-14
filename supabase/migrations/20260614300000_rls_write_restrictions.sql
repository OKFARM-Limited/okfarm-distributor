-- ============================================================
-- Phase 7 Item 1: RLS Write-Restriction Policies
-- Adds INSERT/UPDATE/DELETE policies to 14 tables that
-- currently only have SELECT policies.
-- ============================================================

-- =====================
-- 1. OUTLETS (admin only)
-- =====================
CREATE POLICY "Admin can insert outlets"
  ON public.outlets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update outlets"
  ON public.outlets FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete outlets"
  ON public.outlets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 2. PRODUCTS (admin only)
-- =====================
CREATE POLICY "Admin can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 3. DEPOTS (admin only)
-- =====================
CREATE POLICY "Admin can insert depots"
  ON public.depots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update depots"
  ON public.depots FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete depots"
  ON public.depots FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 4. COMMISSIONS (admin only — calculated by RPC)
-- =====================
CREATE POLICY "Admin can insert commissions"
  ON public.commissions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update commissions"
  ON public.commissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete commissions"
  ON public.commissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 5. PAYOUTS (admin only)
-- =====================
CREATE POLICY "Admin can insert payouts"
  ON public.payouts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update payouts"
  ON public.payouts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete payouts"
  ON public.payouts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 6. SETTLEMENTS (admin only)
-- =====================
CREATE POLICY "Admin can insert settlements"
  ON public.settlements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update settlements"
  ON public.settlements FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete settlements"
  ON public.settlements FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 7. SETTLEMENT LINES (admin only)
-- =====================
CREATE POLICY "Admin can insert settlement_lines"
  ON public.settlement_lines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update settlement_lines"
  ON public.settlement_lines FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete settlement_lines"
  ON public.settlement_lines FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 8. AUDIT LOGS (trigger-only insert; admin delete for cleanup)
-- No direct INSERT policy — triggers use SECURITY DEFINER.
-- =====================
CREATE POLICY "Admin can delete audit_logs"
  ON public.audit_logs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 9. INCENTIVE PROGRAMS (admin only)
-- =====================
CREATE POLICY "Admin can insert incentive_programs"
  ON public.incentive_programs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update incentive_programs"
  ON public.incentive_programs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete incentive_programs"
  ON public.incentive_programs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 10. VENDOR INCENTIVES (manager+ insert/update, admin delete)
-- =====================
CREATE POLICY "Managers can insert vendor_incentives"
  ON public.vendor_incentives FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Managers can update vendor_incentives"
  ON public.vendor_incentives FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admin can delete vendor_incentives"
  ON public.vendor_incentives FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 11. TRAINING MODULES (admin only)
-- =====================
CREATE POLICY "Admin can insert training_modules"
  ON public.training_modules FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update training_modules"
  ON public.training_modules FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete training_modules"
  ON public.training_modules FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 12. FORECASTS (admin only — system-generated)
-- =====================
CREATE POLICY "Admin can insert forecasts"
  ON public.forecasts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update forecasts"
  ON public.forecasts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete forecasts"
  ON public.forecasts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 13. USER ROLES (admin only)
-- =====================
CREATE POLICY "Admin can insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- 14. APP SETTINGS (admin only)
-- =====================
CREATE POLICY "Admin can insert app_settings"
  ON public.app_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update app_settings"
  ON public.app_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete app_settings"
  ON public.app_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
