
-- ============================================================
-- PHASE 1+2: Foundation + Core Operations
-- ============================================================

-- 1. Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'assistant');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Outlets table
CREATE TABLE public.outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  manager TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view outlets" ON public.outlets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage outlets" ON public.outlets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_outlets_updated_at
  BEFORE UPDATE ON public.outlets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pack',
  barcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  territory TEXT,
  outlet_id UUID REFERENCES public.outlets(id),
  biometrics_enabled BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  join_date DATE DEFAULT CURRENT_DATE,
  total_sales NUMERIC DEFAULT 0,
  days_worked INTEGER DEFAULT 0,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id TEXT,
  address TEXT,
  next_of_kin TEXT,
  next_of_kin_phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  guarantor_name TEXT,
  guarantor_phone TEXT,
  mobile_money_number TEXT,
  education_level TEXT,
  marital_status TEXT,
  languages TEXT[],
  uniform_size TEXT,
  health_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendors" ON public.vendors
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage vendors" ON public.vendors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can insert vendors" ON public.vendors
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Assistants can update vendors" ON public.vendors
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assistant'));

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('push_cart', 'bicycle', 'tricycle')),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance')),
  assigned_to UUID REFERENCES public.vendors(id),
  outlet_id UUID REFERENCES public.outlets(id),
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'poor')),
  next_maintenance_date DATE,
  maintenance_history JSONB DEFAULT '[]'::jsonb,
  condition_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assets" ON public.assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage assets" ON public.assets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assistants can update assets" ON public.assets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assistant'));

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Depots table
CREATE TABLE public.depots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  territory TEXT,
  outlet_id UUID REFERENCES public.outlets(id),
  vendor_count INTEGER DEFAULT 0,
  asset_count INTEGER DEFAULT 0,
  fridge_capacity INTEGER DEFAULT 200,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  manager TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.depots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view depots" ON public.depots
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage depots" ON public.depots
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_depots_updated_at
  BEFORE UPDATE ON public.depots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_vendors_outlet ON public.vendors(outlet_id);
CREATE INDEX idx_vendors_status ON public.vendors(status);
CREATE INDEX idx_assets_outlet ON public.assets(outlet_id);
CREATE INDEX idx_assets_assigned ON public.assets(assigned_to);
CREATE INDEX idx_depots_outlet ON public.depots(outlet_id);
