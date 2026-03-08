-- Step 2: Manager RLS policies

-- Vendors
CREATE POLICY "Managers can insert vendors" ON public.vendors FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can update vendors" ON public.vendors FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Sales
CREATE POLICY "Managers can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

-- Allocations
CREATE POLICY "Managers can insert allocations" ON public.allocations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can insert allocation_items" ON public.allocation_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

-- Reconciliations
CREATE POLICY "Managers can insert reconciliations" ON public.reconciliations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can insert reconciliation_items" ON public.reconciliation_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

-- Check-ins
CREATE POLICY "Managers can insert check_ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can update check_ins" ON public.check_ins FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Orders
CREATE POLICY "Managers can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can insert order_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

-- Stock levels
CREATE POLICY "Managers can update stock_levels" ON public.stock_levels FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Inbound deliveries
CREATE POLICY "Managers can update deliveries" ON public.inbound_deliveries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'manager'::app_role));

-- Payments
CREATE POLICY "Managers can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));