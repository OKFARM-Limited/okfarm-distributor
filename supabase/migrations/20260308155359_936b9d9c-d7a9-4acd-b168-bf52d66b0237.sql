
-- =============================================
-- PHASE 5: ANALYTICS & SUPPORT
-- =============================================

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  total_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inbound Deliveries
CREATE TABLE public.inbound_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  supplier TEXT NOT NULL DEFAULT 'FanMilk',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  credit_term_days INTEGER NOT NULL DEFAULT 30,
  total_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  received_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.inbound_deliveries(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock Levels
CREATE TABLE public.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 50,
  max_stock INTEGER NOT NULL DEFAULT 500,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, outlet_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'medium',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 6: EXTRAS
-- =============================================

-- Incentive Programs
CREATE TABLE public.incentive_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  eligibility_criteria TEXT,
  reward TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.incentive_programs(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'eligible',
  awarded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Modules
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT,
  mandatory BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, module_id)
);

-- Forecasts
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL,
  avg_daily_sales NUMERIC NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  days_until_stockout INTEGER NOT NULL DEFAULT 0,
  suggested_order INTEGER NOT NULL DEFAULT 0,
  order_value NUMERIC NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add GPS columns to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS route_data JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_orders_outlet ON public.orders(outlet_id);
CREATE INDEX idx_orders_date ON public.orders(order_date);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_inbound_outlet ON public.inbound_deliveries(outlet_id);
CREATE INDEX idx_inbound_date ON public.inbound_deliveries(date);
CREATE INDEX idx_delivery_items_delivery ON public.delivery_items(delivery_id);
CREATE INDEX idx_stock_levels_product ON public.stock_levels(product_id);
CREATE INDEX idx_stock_levels_outlet ON public.stock_levels(outlet_id);
CREATE INDEX idx_notifications_outlet ON public.notifications(outlet_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX idx_vendor_incentives_vendor ON public.vendor_incentives(vendor_id);
CREATE INDEX idx_vendor_incentives_program ON public.vendor_incentives(program_id);
CREATE INDEX idx_vendor_training_vendor ON public.vendor_training_progress(vendor_id);
CREATE INDEX idx_vendor_training_module ON public.vendor_training_progress(module_id);
CREATE INDEX idx_forecasts_product ON public.forecasts(product_id);
CREATE INDEX idx_vendors_lat_lng ON public.vendors(latitude, longitude);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- Orders RLS
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage order_items" ON public.order_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert order_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view order_items" ON public.order_items FOR SELECT TO authenticated USING (true);

-- Inbound Deliveries RLS
CREATE POLICY "Admins can manage deliveries" ON public.inbound_deliveries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can update deliveries" ON public.inbound_deliveries FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view deliveries" ON public.inbound_deliveries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage delivery_items" ON public.delivery_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view delivery_items" ON public.delivery_items FOR SELECT TO authenticated USING (true);

-- Stock Levels RLS
CREATE POLICY "Admins can manage stock_levels" ON public.stock_levels FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can update stock_levels" ON public.stock_levels FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view stock_levels" ON public.stock_levels FOR SELECT TO authenticated USING (true);

-- Notifications RLS
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Audit Logs RLS
CREATE POLICY "Admins can manage audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Incentive Programs RLS
CREATE POLICY "Admins can manage incentive_programs" ON public.incentive_programs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view incentive_programs" ON public.incentive_programs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage vendor_incentives" ON public.vendor_incentives FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view vendor_incentives" ON public.vendor_incentives FOR SELECT TO authenticated USING (true);

-- Training RLS
CREATE POLICY "Admins can manage training_modules" ON public.training_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view training_modules" ON public.training_modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage vendor_training" ON public.vendor_training_progress FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can update vendor_training" ON public.vendor_training_progress FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'assistant'));
CREATE POLICY "Authenticated can view vendor_training" ON public.vendor_training_progress FOR SELECT TO authenticated USING (true);

-- Forecasts RLS
CREATE POLICY "Admins can manage forecasts" ON public.forecasts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view forecasts" ON public.forecasts FOR SELECT TO authenticated USING (true);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.inbound_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incentive_programs_updated_at BEFORE UPDATE ON public.incentive_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_levels;
