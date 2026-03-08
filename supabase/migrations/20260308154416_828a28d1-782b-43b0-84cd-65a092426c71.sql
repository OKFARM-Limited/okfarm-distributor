
-- =============================================
-- PHASE 3: DAILY OPERATIONS
-- =============================================

-- Allocations
CREATE TABLE public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.allocation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES public.allocations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reconciliations
CREATE TABLE public.reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES public.allocations(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_returned INTEGER NOT NULL DEFAULT 0,
  total_spoilage INTEGER NOT NULL DEFAULT 0,
  total_sold INTEGER NOT NULL DEFAULT 0,
  cash_collected NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES public.reconciliations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  allocated_qty INTEGER NOT NULL DEFAULT 0,
  returned_qty INTEGER NOT NULL DEFAULT 0,
  spoilage_qty INTEGER NOT NULL DEFAULT 0,
  sold_qty INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  outstanding NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 4: FINANCIAL
-- =============================================

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  provider TEXT,
  phone_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commissions
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  month TEXT NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  days_worked INTEGER NOT NULL DEFAULT 0,
  avg_daily_sales NUMERIC NOT NULL DEFAULT 0,
  consistency_rate NUMERIC NOT NULL DEFAULT 0,
  consistency_multiplier NUMERIC NOT NULL DEFAULT 1,
  volume_bonus NUMERIC NOT NULL DEFAULT 0,
  consistency_bonus NUMERIC NOT NULL DEFAULT 0,
  attendance_bonus NUMERIC NOT NULL DEFAULT 0,
  total_commission NUMERIC NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payouts
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT DEFAULT 'mobile_money',
  reference TEXT,
  disbursed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settlements
CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  month TEXT NOT NULL,
  total_receivable NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  discount_rate NUMERIC NOT NULL DEFAULT 0,
  net_payable NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.settlement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  credit_days INTEGER NOT NULL DEFAULT 30,
  due_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'due',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_allocations_vendor ON public.allocations(vendor_id);
CREATE INDEX idx_allocations_outlet ON public.allocations(outlet_id);
CREATE INDEX idx_allocations_date ON public.allocations(date);
CREATE INDEX idx_allocation_items_alloc ON public.allocation_items(allocation_id);
CREATE INDEX idx_reconciliations_vendor ON public.reconciliations(vendor_id);
CREATE INDEX idx_reconciliations_alloc ON public.reconciliations(allocation_id);
CREATE INDEX idx_check_ins_vendor ON public.check_ins(vendor_id);
CREATE INDEX idx_check_ins_date ON public.check_ins(date);
CREATE INDEX idx_sales_vendor ON public.sales(vendor_id);
CREATE INDEX idx_sales_outlet ON public.sales(outlet_id);
CREATE INDEX idx_sales_date ON public.sales(date);
CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_payments_vendor ON public.payments(vendor_id);
CREATE INDEX idx_payments_date ON public.payments(date);
CREATE INDEX idx_commissions_vendor ON public.commissions(vendor_id);
CREATE INDEX idx_commissions_month ON public.commissions(month);
CREATE INDEX idx_payouts_commission ON public.payouts(commission_id);
CREATE INDEX idx_settlements_outlet ON public.settlements(outlet_id);
CREATE INDEX idx_settlements_month ON public.settlements(month);
CREATE INDEX idx_settlement_lines_settlement ON public.settlement_lines(settlement_id);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_lines ENABLE ROW LEVEL SECURITY;

-- Allocations RLS
CREATE POLICY "Admins can manage allocations" ON public.allocations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert allocations" ON public.allocations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view allocations" ON public.allocations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage allocation_items" ON public.allocation_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert allocation_items" ON public.allocation_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view allocation_items" ON public.allocation_items FOR SELECT TO authenticated USING (true);

-- Reconciliations RLS
CREATE POLICY "Admins can manage reconciliations" ON public.reconciliations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert reconciliations" ON public.reconciliations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view reconciliations" ON public.reconciliations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage reconciliation_items" ON public.reconciliation_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert reconciliation_items" ON public.reconciliation_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view reconciliation_items" ON public.reconciliation_items FOR SELECT TO authenticated USING (true);

-- Check-ins RLS
CREATE POLICY "Admins can manage check_ins" ON public.check_ins FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert check_ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Assistants can update check_ins" ON public.check_ins FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view check_ins" ON public.check_ins FOR SELECT TO authenticated USING (true);

-- Sales RLS
CREATE POLICY "Admins can manage sales" ON public.sales FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view sales" ON public.sales FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage sale_items" ON public.sale_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);

-- Payments RLS
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view payments" ON public.payments FOR SELECT TO authenticated USING (true);

-- Commissions RLS
CREATE POLICY "Admins can manage commissions" ON public.commissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view commissions" ON public.commissions FOR SELECT TO authenticated USING (true);

-- Payouts RLS
CREATE POLICY "Admins can manage payouts" ON public.payouts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view payouts" ON public.payouts FOR SELECT TO authenticated USING (true);

-- Settlements RLS
CREATE POLICY "Admins can manage settlements" ON public.settlements FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view settlements" ON public.settlements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settlement_lines" ON public.settlement_lines FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view settlement_lines" ON public.settlement_lines FOR SELECT TO authenticated USING (true);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================
CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON public.allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reconciliations_updated_at BEFORE UPDATE ON public.reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON public.settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
