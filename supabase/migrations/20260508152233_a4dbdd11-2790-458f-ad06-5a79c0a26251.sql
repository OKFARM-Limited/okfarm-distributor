
-- 1. Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  channel_in_app boolean NOT NULL DEFAULT true,
  channel_email boolean NOT NULL DEFAULT true,
  channel_push boolean NOT NULL DEFAULT true,
  cat_stock boolean NOT NULL DEFAULT true,
  cat_payment boolean NOT NULL DEFAULT true,
  cat_sales boolean NOT NULL DEFAULT true,
  cat_system boolean NOT NULL DEFAULT true,
  daily_digest boolean NOT NULL DEFAULT false,
  email_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view all preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_notif_prefs_updated
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Vendor portal: link vendor to auth user
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS auth_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_vendors_auth_user_id ON public.vendors(auth_user_id);

-- Allow vendors to view their own record + related data
CREATE POLICY "Vendors view own record" ON public.vendors
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

CREATE POLICY "Vendors view own sales" ON public.sales
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Vendors view own allocations" ON public.allocations
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Vendors view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Vendors view own commissions" ON public.commissions
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Vendors view own check_ins" ON public.check_ins
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid()));

-- 3. Photo proof columns
ALTER TABLE public.inbound_deliveries ADD COLUMN IF NOT EXISTS proof_photo_url text;
ALTER TABLE public.reconciliations    ADD COLUMN IF NOT EXISTS proof_photo_url text;

-- 4. Storage bucket for proof photos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('vendor-photos','vendor-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read vendor-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vendor-photos');
CREATE POLICY "Authenticated upload vendor-photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vendor-photos');
CREATE POLICY "Authenticated update vendor-photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'vendor-photos');

-- 5. Bulk import audit
CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  inserted_rows integer NOT NULL DEFAULT 0,
  failed_rows integer NOT NULL DEFAULT 0,
  errors jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage import_batches" ON public.import_batches
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
