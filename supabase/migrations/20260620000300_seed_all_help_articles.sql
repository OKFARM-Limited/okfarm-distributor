-- Seed remaining Help Categories
INSERT INTO public.help_categories (title, slug, display_order) VALUES
  ('Finance', 'finance', 3),
  ('Analytics', 'analytics', 4),
  ('Programs', 'programs', 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed Help Articles for every module in the application
DO $$
DECLARE
  cat_started_id uuid;
  cat_ops_id uuid;
  cat_inv_id uuid;
  cat_fin_id uuid;
  cat_ana_id uuid;
  cat_pro_id uuid;
  cat_admin_id uuid;

  -- Operations IDs
  art_vendors_id uuid;
  art_checkin_id uuid;
  art_assets_id uuid;
  art_allocation_id uuid;
  art_allocation_history_id uuid;

  -- Inventory IDs
  art_scanner_id uuid;

  -- Finance IDs
  art_sales_entry_id uuid;
  art_payments_id uuid;
  art_mobile_money_id uuid;
  art_dues_id uuid;

  -- Analytics IDs
  art_performance_id uuid;
  art_maps_id uuid;

  -- Programs IDs
  art_incentives_id uuid;
  art_academy_id uuid;

  -- Admin IDs
  art_outlets_id uuid;
  art_products_id uuid;
  art_commissions_id uuid;
  art_payouts_id uuid;
  art_orders_id uuid;
  art_forecast_id uuid;
  art_settlement_id uuid;
  art_depots_id uuid;
  art_audit_id uuid;
  art_roles_id uuid;
  art_permissions_id uuid;
  art_bulk_id uuid;
BEGIN
  -- Retrieve Category IDs
  SELECT id INTO cat_started_id FROM public.help_categories WHERE slug = 'getting-started';
  SELECT id INTO cat_ops_id FROM public.help_categories WHERE slug = 'operations';
  SELECT id INTO cat_inv_id FROM public.help_categories WHERE slug = 'inventory';
  SELECT id INTO cat_fin_id FROM public.help_categories WHERE slug = 'finance';
  SELECT id INTO cat_ana_id FROM public.help_categories WHERE slug = 'analytics';
  SELECT id INTO cat_pro_id FROM public.help_categories WHERE slug = 'programs';
  SELECT id INTO cat_admin_id FROM public.help_categories WHERE slug = 'administration';

  -- ==========================================
  -- 1. OPERATIONS MODULES
  -- ==========================================

  -- Vendors Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Managing Distributors & Vendors',
    'ops-vendors',
    '/vendors',
    '# Managing Distributors & Vendors

Use the Vendors module to register, track, and monitor sales representatives and field agents.

## ➕ Registering a New Vendor
1. Click the **Add Vendor** button.
2. Fill in the vendor name, phone number, and assign them to a warehouse Depot.
3. Specify their credit limits and commission profiles.

## 📊 Monitoring Performance
Click on any vendor in the table to load their transaction ledger, active refrigerator asset serials, and historical sales trends.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_vendors_id;

  -- Check-in Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Vendor Shift Attendance & Check-In',
    'ops-checkin',
    '/checkin',
    '# Vendor Attendance & Check-In

Field agents must check in before loading inventory.

## ⏰ Check-In Workflow
1. When the vendor arrives, locate their name in the check-in list.
2. Verify their identity and click **Check In**.
3. Record their starting vehicle mileage and confirm the refrigerator temperature matches guidelines.

## 🏁 Check-Out Workflow
At the end of the shift, log vehicle returns, click **Check Out**, and input closing mileage.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_checkin_id;

  -- Assets Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Cold-Chain Asset Management',
    'ops-assets',
    '/assets',
    '# Cold-Chain & Asset Management

This module tracks mobile cold storage units, pushcarts, and retail refrigerators.

## ❄️ Assigning Assets
1. Open the Assets tab.
2. Find the target equipment serial number.
3. Click **Assign Asset** and select the designated Vendor or Retail Outlet.

## 🔧 Logging Maintenance
Change status from `active` to `needs repair` to schedule technical checks.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_assets_id;

  -- Allocation Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Daily Load-Out Stock Allocation',
    'ops-allocation',
    '/allocation',
    '# Daily Stock Allocation

Allocate warehouse products to vendor vans before field sales runs.

## 📥 Allocation Workflow
1. Click **New Allocation** to open the wizard.
2. Select the vendor and depot source.
3. Enter load-out quantities for each product SKU.
4. Verify overall load values and click **Confirm**.

> [!NOTE]
> Stock is deducted from the depot inventory and added to the vendor''s active balance.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_allocation_id;

  -- Allocation History Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ops_id,
    'Auditing Allocation History',
    'ops-allocation-history',
    '/allocation/history',
    '# Allocation History Logs

Review and reprint historical stock load-outs.

## 🔍 Auditing allocations
- Use filters to search allocations by vendor or date range.
- Click **View Details** to print waybills or export logs.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_allocation_history_id;

  -- ==========================================
  -- 2. INVENTORY MODULES
  -- ==========================================

  -- Scanner Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_inv_id,
    'Using the QR/Barcode Scanner',
    'inv-scanner',
    '/scanner',
    '# QR/Barcode Scanner Guide

Scan product codes for inventory checks.

## 📷 Scanning Steps
1. Tap **Open Scanner** on your mobile screen.
2. Point your camera at the barcode/QR code printed on the item packing.
3. The system automatically fetches SKU details and displays current stock levels.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_scanner_id;

  -- ==========================================
  -- 3. FINANCE MODULES
  -- ==========================================

  -- Sales Entry Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_fin_id,
    'Logging Sales & Invoices',
    'fin-sales-entry',
    '/sales',
    '# Recording Field Sales

Log customer wholesale transactions.

## ✍️ Recording sales
1. Select the client or outlet.
2. Specify quantities sold.
3. Set the payment mode to **Cash** or **Credit**.
4. Submit to update vendor targets and calculate commission accruals.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_sales_entry_id;

  -- Payments Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_fin_id,
    'Recording Dues Collections & Payments',
    'fin-payments',
    '/payments',
    '# Logging Payments

Record collections for outstanding credit sales.

## 💳 Payment Logging
1. Click **Record Payment**.
2. Select the customer or invoice ref.
3. Enter the cash/bank-receipt value.
4. Submit to update credit balances.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_payments_id;

  -- Mobile Money Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_fin_id,
    'Mobile Money disbursements',
    'fin-mobile-money',
    '/mobile-money',
    '# Mobile Money Integration

Track digital wallet payments.

> [!NOTE]
> Mobile money payments are currently greyed out pending telco wallet integration.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_mobile_money_id;

  -- Dues Statement Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_fin_id,
    'Vendor Dues Ledgers & Statements',
    'fin-dues',
    '/dues',
    '# Vendor Account Dues Statements

Review vendor accounts, outstanding debts, and daily cash collection logs.

- **Dues balance:** Highlights amount owed by vendors.
- **Credit Limit alerts:** Flags accounts near threshold limits.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_dues_id;

  -- ==========================================
  -- 4. ANALYTICS MODULES
  -- ==========================================

  -- Performance Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ana_id,
    'Sales Performance Metrics & Analytics',
    'ana-performance',
    '/performance',
    '# Performance Dashboard

Analyze operational trends and efficiency ratings.

- **KPI Cards:** Track sales volume, returns, and commission.
- **Graphs:** Compare weekly metrics against monthly targets.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_performance_id;

  -- Maps Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_ana_id,
    'Vendor Geolocation Maps',
    'ana-maps',
    '/map',
    '# Geolocation Map Tracking

Track coordinates of assets and field check-ins.

- **Live Pins:** View outlet coordinate positions.
- **Fridge Serials:** Click pins to see active cold assets.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_maps_id;

  -- ==========================================
  -- 5. PROGRAMS MODULES
  -- ==========================================

  -- Incentives Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_pro_id,
    'Loyalty Incentives & Rewards',
    'pro-incentives',
    '/incentives',
    '# Vendor Loyalty Incentives

Manage rewards programs for high-performing vendors.

- **Point Accrual:** Points update automatically upon target completion.
- **Redemption:** Click **Redeem** to swap points for fuel vouchers or gifts.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_incentives_id;

  -- Fan Academy Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_pro_id,
    'Fan Academy: Training Modules',
    'pro-academy',
    '/training',
    '# Fan Academy Learning portal

Access vendor training guides and cold-chain temperature safety courses.

- Click on a course card to start learning modules.
- Complete quizzes to earn certifications.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_academy_id;

  -- ==========================================
  -- 6. ADMINISTRATION MODULES
  -- ==========================================

  -- Outlets Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Managing Outlets & Branches',
    'admin-outlets',
    '/outlets',
    '# Managing Retail Outlets

Add, update, or deprecate retail customer branches.

## 🏪 Add Outlet
1. Click **Add Outlet**.
2. Set Code and Address.
3. Assign a branch manager from the dropdown list.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_outlets_id;

  -- Products Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Managing Products & SKUs',
    'admin-products',
    '/products',
    '# Managing Product catalog

Configure inventory product SKUs and standard prices.

## 📦 Setting Up Products
1. Click **Add Product**.
2. Enter Name, SKU code, category, and Unit Price in Naira (₦).'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_products_id;

  -- Commissions Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Setting Commission Profiles',
    'admin-commissions',
    '/commissions',
    '# Setting Commission Profiles

Define commissions calculations rules.

- Set base commission percentages per product category.
- Commissions are calculated automatically upon sales completion.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_commissions_id;

  -- Payouts Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Processing Commission Payouts',
    'admin-payouts',
    '/payouts',
    '# Processing Commission Payouts

Review accumulated commission and disburse payments.

> [!NOTE]
> The disburse actions are locked pending Mobile Money wallet integration.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_payouts_id;

  -- Orders Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Confirming Outlet Orders',
    'admin-orders',
    '/orders',
    '# Confirming Outlet Orders

Admins and managers confirm outlet orders here.

- Locate `pending` orders.
- Change status to `confirmed` to initiate load-out allocation.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_orders_id;

  -- Forecast Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Demand Forecasting & Safety Reorders',
    'admin-forecast',
    '/forecast',
    '# Demand Forecasting

Uses historical sales to forecast stock requirements.

- Review **Reorder Alerts** for products nearing safety levels.
- View predicted reorder quantities.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_forecast_id;

  -- Settlement Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Monthly Financial Settlements',
    'admin-settlement',
    '/settlement',
    '# Financial Settlement

Close monthly books by reconciling cash balances against bank receipts.

- Record depot deposits.
- Mark reconciled periods closed.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_settlement_id;

  -- Depots Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Managing Depot Warehouses',
    'admin-depots',
    '/depots',
    '# Managing Depots

Configure warehouse locations and check limits.

- **Add Depot:** Locked button. Contact main office to assign warehouse codes.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_depots_id;

  -- Audit Trail Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'System Audit Logs & Security Trails',
    'admin-audit',
    '/audit',
    '# System Audit Trail

Auditors inspect security logs of user actions.

- Tracks profile updates, role re-assignments, and stock recalculations.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_audit_id;

  -- User Roles Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Provisioning User Accounts & Roles',
    'admin-roles',
    '/roles',
    '# User Account & Role Management

Assign system roles (`admin`, `manager`, `assistant`, `viewer`) to profiles.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_roles_id;

  -- Permissions Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Granular Role Permissions Matrix',
    'admin-permissions',
    '/permissions',
    '# Role Permissions Matrix

Define modules read/write access constraints.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_permissions_id;

  -- Bulk Import Article
  INSERT INTO public.help_articles (category_id, title, slug, path_trigger, body_markdown)
  VALUES (
    cat_admin_id,
    'Bulk Importing Data via Excel/CSV Templates',
    'admin-bulk',
    '/bulk-import',
    '# Bulk Importing Data

Download standard templates and upload lists for products or outlets.'
  )
  ON CONFLICT (slug) DO UPDATE SET body_markdown = EXCLUDED.body_markdown
  RETURNING id INTO art_bulk_id;

  -- ==========================================
  -- ROLE ASSIGNMENTS FOR NEW ARTICLES
  -- ==========================================

  -- 1. Operations
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_vendors_id, 'admin'), (art_vendors_id, 'manager'), (art_vendors_id, 'assistant'),
    (art_checkin_id, 'admin'), (art_checkin_id, 'manager'), (art_checkin_id, 'assistant'),
    (art_assets_id, 'admin'), (art_assets_id, 'manager'), (art_assets_id, 'assistant'),
    (art_allocation_id, 'admin'), (art_allocation_id, 'manager'), (art_allocation_id, 'assistant'),
    (art_allocation_history_id, 'admin'), (art_allocation_history_id, 'manager'), (art_allocation_history_id, 'assistant'), (art_allocation_history_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- 2. Inventory
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_scanner_id, 'admin'), (art_scanner_id, 'manager'), (art_scanner_id, 'assistant')
  ON CONFLICT DO NOTHING;

  -- 3. Finance
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_sales_entry_id, 'admin'), (art_sales_entry_id, 'manager'), (art_sales_entry_id, 'assistant'),
    (art_payments_id, 'admin'), (art_payments_id, 'manager'), (art_payments_id, 'assistant'),
    (art_mobile_money_id, 'admin'), (art_mobile_money_id, 'manager'), (art_mobile_money_id, 'assistant'),
    (art_dues_id, 'admin'), (art_dues_id, 'manager'), (art_dues_id, 'assistant'), (art_dues_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- 4. Analytics
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_performance_id, 'admin'), (art_performance_id, 'manager'), (art_performance_id, 'assistant'), (art_performance_id, 'viewer'),
    (art_maps_id, 'admin'), (art_maps_id, 'manager'), (art_maps_id, 'assistant'), (art_maps_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- 5. Programs
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_incentives_id, 'admin'), (art_incentives_id, 'manager'), (art_incentives_id, 'assistant'), (art_incentives_id, 'viewer'),
    (art_academy_id, 'admin'), (art_academy_id, 'manager'), (art_academy_id, 'assistant'), (art_academy_id, 'viewer')
  ON CONFLICT DO NOTHING;

  -- 6. Administration
  INSERT INTO public.help_article_roles (article_id, role_name) VALUES
    (art_outlets_id, 'admin'), (art_outlets_id, 'manager'),
    (art_products_id, 'admin'), (art_products_id, 'manager'),
    (art_commissions_id, 'admin'), (art_commissions_id, 'manager'),
    (art_payouts_id, 'admin'), (art_payouts_id, 'manager'),
    (art_orders_id, 'admin'), (art_orders_id, 'manager'),
    (art_forecast_id, 'admin'), (art_forecast_id, 'manager'),
    (art_settlement_id, 'admin'), (art_settlement_id, 'manager'),
    (art_depots_id, 'admin'), (art_depots_id, 'manager'),
    (art_audit_id, 'admin'),
    (art_roles_id, 'admin'),
    (art_permissions_id, 'admin'),
    (art_bulk_id, 'admin')
  ON CONFLICT DO NOTHING;

END $$;
