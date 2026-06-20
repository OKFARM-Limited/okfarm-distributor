-- Create help categories table
CREATE TABLE IF NOT EXISTS public.help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create help articles table
CREATE TABLE IF NOT EXISTS public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.help_categories(id) ON DELETE SET NULL,
  title varchar(200) NOT NULL,
  slug varchar(200) UNIQUE NOT NULL,
  body_markdown text NOT NULL,
  path_trigger varchar(100), -- context-aware URL path matching (e.g. '/stock-recalc')
  video_url varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create help article roles join table
CREATE TABLE IF NOT EXISTS public.help_article_roles (
  article_id uuid REFERENCES public.help_articles(id) ON DELETE CASCADE,
  role_name app_role NOT NULL,
  PRIMARY KEY (article_id, role_name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_roles ENABLE ROW LEVEL SECURITY;

-- Select policies for authenticated users
CREATE POLICY "Allow authenticated to read help_categories"
  ON public.help_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to read help_articles"
  ON public.help_articles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to read help_article_roles"
  ON public.help_article_roles FOR SELECT TO authenticated USING (true);

-- Manage policies for admins (all actions)
CREATE POLICY "Allow admins to manage help_categories"
  ON public.help_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow admins to manage help_articles"
  ON public.help_articles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow admins to manage help_article_roles"
  ON public.help_article_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed Help Categories
INSERT INTO public.help_categories (title, slug, display_order) VALUES
  ('Getting Started', 'getting-started', 1),
  ('Operations', 'operations', 2),
  ('Inventory', 'inventory', 3),
  ('Administration', 'administration', 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed Help Articles
DO $$
DECLARE
  cat_started_id uuid;
  cat_ops_id uuid;
  cat_inv_id uuid;
  cat_admin_id uuid;
  art_welcome_id uuid;
  art_vendor_id uuid;
  art_recalc_id uuid;
  art_inbound_id uuid;
  art_recon_id uuid;
BEGIN
  -- Retrieve Category IDs
  SELECT id INTO cat_started_id FROM public.help_categories WHERE slug = 'getting-started';
  SELECT id INTO cat_ops_id FROM public.help_categories WHERE slug = 'operations';
  SELECT id INTO cat_inv_id FROM public.help_categories WHERE slug = 'inventory';
  SELECT id INTO cat_admin_id FROM public.help_categories WHERE slug = 'administration';

  -- 1. Welcome to Distribo Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_started_id,
    'Welcome to Distribo',
    'welcome-to-distribo',
    '/',
    '# Getting Started with Distribo

Distribo is your unified portal for distribution, operations, and sales tracking.

## 🧭 Dashboard KPIs
- **Total Sales (Today):** Tracks all real-time invoice totals recorded today in Naira (₦).
- **Active Outlets:** Shows active retail outlets and branches.
- **Inventory Value:** Calculates current total valuation of stock across all active depots.

## ⚙️ Navigation Tips
Use the left sidebar menu to navigate across Operational, Financial, and Administration modules. Click the **Notification Bell** in the top bar to read system alerts.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_welcome_id;

  -- 2. Vendor Playbook
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Vendor Daily Timeline Playbook',
    'vendor-playbook',
    '/vendors',
    '# Vendor Daily Timeline

Follow this daily workflow to ensure correct inventory levels and payments credit tracking.

## 🌅 Morning: Load-out & Check-in
1. Arrive at the depot and complete **Check-In** with the supervisor.
2. Verify your **Stock Allocation**. Ensure loaded inventory matches the items registered in the system.

## ☀️ Afternoon: Field Sales
1. Log retail sales using the **Sales Entry** form.
2. Collect payments and log them (Cash, Bank Transfer).

## 🌇 Evening: Reconciliation
1. Return to the depot and click **Reconciliation**.
2. Count returned (unsold) items and declare any spoilage.
3. Submit cash collections to complete the daily reconciliation cycle.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_vendor_id;

  -- 3. Stock Recalc Guide (Admin only)
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Admin Guide: Stock Recalculation',
    'admin-stock-recalc',
    '/stock-recalc',
    '# Running Stock Recalculation

Use this interface to resolve inventory drift between expected counts and current stock database levels.

## ⚡ Execution Steps
1. Click the **Run Diff** button at the top-right to run the SQL audit.
2. Review the **Mismatched Rows** list.
3. Items with variance exceeding the alert threshold will show a red `alert` badge.
4. Click **Apply Corrections** to overwrite current stock levels with expected calculations.

> [!WARNING]
> Applying corrections cannot be undone automatically. It writes a record to the system audit trail logs.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_recalc_id;

  -- 4. Inbound Stock Guide
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_inv_id,
    'Recording Supplier Inbound Deliveries',
    'inbound-stock-guide',
    '/inventory',
    '# Recording Inbound stock

Follow this guide to record new products arriving from suppliers (e.g. FanMilk).

## 📥 Recording steps
1. Click **Adjust Stock** to open the delivery dialog.
2. Enter the **Invoice Number** (required) and select the date.
3. Click **Add Item** to add product rows and quantities.
4. Capture or upload a copy of the physical invoice/delivery note using the **Capture POD Photo** button.
5. Click **Save Delivery**.

> [!NOTE]
> New deliveries are saved in a `pending` status. You must locate the delivery in the list and click **Mark Received** to update physical warehouse stock totals.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_inbound_id;

  -- 5. Reconciliation Guide
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Reconciling Vendor Cash & Returns',
    'reconciliation-guide',
    '/reconciliation',
    '# End-of-Shift Reconciliation Guide

Reconciliations close out vendor sales runs.

## 📝 Reconciliation Steps
1. Select the vendor name.
2. Input quantities of returned (unsold) products.
3. Input quantities of spoiled/damaged products.
4. Input cash and collections received.
5. The system calculates the variance. If cash + returns matches allocation, click **Submit Reconciliation** to mark completed.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_recon_id;

  -- Add Role permissions for each article
  -- Welcome Guide: all roles
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_welcome_id, 'admin'), (art_welcome_id, 'manager'), (art_welcome_id, 'assistant'), (art_welcome_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- Vendor Playbook: all roles
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_vendor_id, 'admin'), (art_vendor_id, 'manager'), (art_vendor_id, 'assistant'), (art_vendor_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- Stock Recalc: admin only
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_recalc_id, 'admin')
  ON CONFLICT DO NOTHING;

  -- Inbound Stock: admin, manager, assistant
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_inbound_id, 'admin'), (art_inbound_id, 'manager'), (art_inbound_id, 'assistant')
  ON CONFLICT DO NOTHING;

  -- Reconciliation: admin, manager, assistant
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_recon_id, 'admin'), (art_recon_id, 'manager'), (art_recon_id, 'assistant')
  ON CONFLICT DO NOTHING;
END $$;
