# OKFARM Remediation — Pre-Migration Implementation Plan

Remediate Phase 1 (Security Hardening) and Phase 2 (Data Integrity) from the audit before migrating the database schema to the new Supabase environment.

## Strategy

Since you are deploying to a **fresh Supabase instance**, we have two options:

1. **Consolidate all 21 migrations into a single clean migration** — simplest approach, but loses git history of incremental changes
2. **Patch the existing migration files in-place** — fix the issues directly in the SQL files so they apply cleanly to the new environment

> [!IMPORTANT]
> **Recommended: Option 2 (patch in-place).** This preserves the migration history and is safer if the old environment ever needs to stay in sync. The `app_role` enum, RLS policies, and `user_roles` INSERT restrictions will be fixed in the original migration files where they were defined. A final remediation migration will be added for new changes (storage bucket, vendor schema).

## User Review Required

> [!WARNING]
> **New Supabase project setup:** After applying migrations, you will need to:
> 1. Manually deploy the 6 edge functions to the new project
> 2. Update `.env` with the new Supabase URL and anon key
> 3. Create the initial admin account via Supabase Dashboard → Authentication → Users (since self-registration will be disabled)
> 4. Set `edge_functions_url` and `edge_functions_anon_key` in `app_settings` for the email notification system

> [!IMPORTANT]
> **NIN/BVN field:** Currently the `national_id` column in the `vendors` table has no `NOT NULL` constraint at the database level — the `required` enforcement is frontend-only (HTML `required` attribute + JS validation). Making it optional requires only frontend changes, no schema changes.

## Open Questions

> [!IMPORTANT]
> 1. **Supabase Storage bucket naming:** The existing migrations create `vendor-photos` and `invoices` buckets. Should we keep these names in the new environment or rename them?
> 2. **WebP quality setting:** For the client-side WebP conversion, should we target a specific quality level (e.g., 0.85 for near-lossless) or make it configurable in `app_settings`?
> 3. **First admin bootstrap:** How will you create the initial admin user on the new environment? The Supabase Dashboard auth page is the recommended approach since self-registration will be disabled.

---

## Proposed Changes

### Database Migrations

#### [MODIFY] [Migration 1 — Foundation](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308135817_33f88f0e-080c-49ff-adfa-b042951e3aa5.sql)

**1. Fix `app_role` enum (line 16)** — Define all 4 roles from the start:
```diff
- CREATE TYPE public.app_role AS ENUM ('admin', 'assistant');
+ CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'assistant', 'viewer');
```

**2. Restrict `user_roles` INSERT to admins only (line 41-42)** — Prevent self-registration from inserting arbitrary roles:
```diff
  CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));
+ -- No INSERT policy for non-admin users: only admin-create-user edge function
+ -- (which uses service_role) and the admin role can insert into user_roles.
```
No code change needed here — the existing policies already restrict it. But we must ensure the frontend `signup()` function in `AuthContext.tsx` no longer inserts into `user_roles` directly (see Frontend changes below).

**3. Add `vendor-photos` storage bucket** — Move the bucket creation from migration 20 into this file for cleanliness (optional; can be left as-is).

---

#### [MODIFY] [Migration 5 — Add manager role](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308164343_763a86dc-6b2f-4e7f-82a2-85ec8e4f4c8a.sql)

**Remove this file or make it a no-op** — The `manager` value is now in the initial enum definition. This `ALTER TYPE ADD VALUE` will error if the value already exists.

```diff
- ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
+ -- No-op: manager role is defined in the initial enum (migration 1)
+ SELECT 1;
```

---

#### [MODIFY] [Migration 7 — Add viewer role](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308202500_efc9e98a-0d5e-4285-b5a3-a50c8df05119.sql)

Same as above — the `viewer` value is now in the initial enum definition.

```diff
- ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
+ -- No-op: viewer role is defined in the initial enum (migration 1)
+ SELECT 1;
```

---

#### [NEW] [Migration 22 — Remediation](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260614000000_remediation_phase1_phase2.sql)

New migration to add the remaining remediation items:

1. **Create `vendor-photos` storage bucket** (if not already created by migration 20) with WebP-optimized upload policies
2. **Add Supabase Storage policies for WebP uploads** — Allow authenticated users to upload to `vendor-photos` with a file-size limit hint in policy comments
3. **`vendor_code` uniqueness** — Already has `UNIQUE` constraint; add a server-side function for sequential code generation

```sql
-- Remediation Phase 1 + 2

-- 1. Ensure vendor-photos bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-photos','vendor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Transactional sale creation function
CREATE OR REPLACE FUNCTION public.create_sale_with_items(
  p_vendor_id uuid,
  p_outlet_id uuid,
  p_date date,
  p_total_value numeric,
  p_amount_paid numeric,
  p_outstanding numeric,
  p_payment_method text,
  p_items jsonb  -- array of {product_id, quantity, unit_price}
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
BEGIN
  INSERT INTO sales (vendor_id, outlet_id, date, total_value, amount_paid, outstanding, payment_method)
  VALUES (p_vendor_id, p_outlet_id, p_date, p_total_value, p_amount_paid, p_outstanding, p_payment_method)
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
  SELECT v_sale_id, (item->>'product_id')::uuid, (item->>'quantity')::int, (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_sale_id;
END;
$$;

-- 3. Transactional allocation creation function
CREATE OR REPLACE FUNCTION public.create_allocation_with_items(
  p_vendor_id uuid,
  p_outlet_id uuid,
  p_date date,
  p_total_value numeric,
  p_status text,
  p_notes text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alloc_id uuid;
BEGIN
  INSERT INTO allocations (vendor_id, outlet_id, date, total_value, status, notes)
  VALUES (p_vendor_id, p_outlet_id, p_date, p_total_value, p_status, p_notes)
  RETURNING id INTO v_alloc_id;

  INSERT INTO allocation_items (allocation_id, product_id, quantity, unit_price)
  SELECT v_alloc_id, (item->>'product_id')::uuid, (item->>'quantity')::int, (item->>'unit_price')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_alloc_id;
END;
$$;

-- 4. Server-side sequential vendor code generator
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq int;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(vendor_code FROM 5)::int), 0) + 1
  INTO v_seq
  FROM vendors
  WHERE vendor_code ~ '^VND-\d+$';
  
  RETURN 'VND-' || LPAD(v_seq::text, 5, '0');
END;
$$;
```

---

### Frontend — Authentication

#### [MODIFY] [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Login.tsx)

**Disable self-registration entirely:**
- Remove the `TabsList` with "Sign In" / "Sign Up" tabs
- Remove the entire `<TabsContent value="signup">` block (lines 93-128)
- Remove the sign-up related state variables (`signupName`, `signupEmail`, `signupPassword`, `signupRole`)
- Remove the `signup` import from `useAuth`
- Keep only the login form; update the `CardDescription` from "Sign in or create an account" to "Sign in to your account"
- Fix the `navigate()` in render body — replace with `<Navigate to="/" replace />`

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/contexts/AuthContext.tsx)

- Remove the `signup()` function entirely from the context (it inserts into `user_roles` directly, which is the security vulnerability)
- Remove `signup` from the context value and type definition
- Keep `login` and `logout` only

---

### Frontend — Vendor Onboarding

#### [MODIFY] [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorOnboarding.tsx)

**1. Make NIN/BVN optional (line 54, 161):**
- Remove the validation check: `if (!form.name || !form.phone || !form.national_id)` → `if (!form.name || !form.phone)`
- Remove `required` attribute from the National ID input field
- Update the label from `National ID (NIN) *` to `National ID (NIN/BVN)`

**2. Convert photo to WebP before upload (lines 43-50):**
- Replace the base64 `FileReader` approach with a Canvas-based WebP conversion
- Upload the WebP blob to Supabase Storage (`vendor-photos` bucket)
- Save only the public URL in `photo_url`, not the base64 string
- Target quality: 0.85 (high quality, ~40% size reduction vs JPEG)

**3. Fix vendor code generation (line 59):**
- Replace `VND-${Date.now().toString().slice(-6)}` with an RPC call to `generate_vendor_code()`

---

### Frontend — Image Utilities

#### [NEW] [src/lib/imageUtils.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/lib/imageUtils.ts)

New utility module for client-side image processing:

- `convertToWebP(file: File, quality?: number): Promise<Blob>` — Uses HTML Canvas to convert any image to WebP format at configurable quality (default 0.85)
- `uploadImage(blob: Blob, bucket: string, path: string): Promise<string>` — Uploads a blob to Supabase Storage and returns the public URL
- Max dimension resizing (e.g., 1200px max width/height) to prevent oversized uploads while preserving quality

---

### Frontend — Sales Entry (Transactional Writes)

#### [MODIFY] [useSupabaseData.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useSupabaseData.ts)

**Replace `useCreateSale` mutation:**
- Instead of two separate inserts (`sales` then `sale_items`), call the new `create_sale_with_items` RPC function
- Items are passed as a JSONB array, and the entire operation runs in a single PostgreSQL transaction

**Replace `useCreateAllocation` mutation:**
- Same approach — call `create_allocation_with_items` RPC function

---

### Frontend — Dashboard

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Dashboard.tsx)

**Remove hardcoded fallback values (line ~50-52):**
```diff
- { name: t('cash'), value: todayCash || 65, color: '#3b82f6' },
- { name: 'Mobile Money', value: todayMoMo || 10, color: '#8b5cf6' },
+ { name: t('cash'), value: todayCash, color: '#3b82f6' },
+ { name: 'Mobile Money', value: todayMoMo, color: '#8b5cf6' },
```
Show real zero values instead of fake data.

---

### Environment Configuration

#### [NEW] [.env.example](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/.env.example)

Create a template file for new environment setup:
```
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

#### [MODIFY] [.gitignore](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/.gitignore)

Add `.env` to gitignore to prevent accidental key commits.

---

## Verification Plan

### Automated Tests
- `npx supabase db reset` on local Supabase to verify all migrations apply cleanly in sequence
- Test the new RPC functions (`create_sale_with_items`, `create_allocation_with_items`, `generate_vendor_code`) via Supabase SQL Editor

### Manual Verification
1. **Self-registration disabled:** Visit `/login` → confirm only Sign In form is shown, no Sign Up tab
2. **NIN/BVN optional:** Go to `/vendors/onboard` → verify the National ID field is not required; submit without it
3. **WebP image upload:** Upload a JPEG photo on vendor onboarding → verify it's stored as `.webp` in Supabase Storage, not as base64 in the `vendors.photo_url` column
4. **Vendor code:** Create a new vendor → verify code follows `VND-00001` sequential pattern
5. **Transactional sales:** Create a sale with multiple products → verify both `sales` and `sale_items` records exist; simulate a failure to confirm atomicity
6. **Dashboard zeros:** Load dashboard with no sales data → confirm charts show 0, not 65/10
7. **RLS 4-role check:** Test as each role (admin, manager, assistant, viewer) that the correct operations are allowed/denied
8. **Migration on new Supabase:** Link the project to the new Supabase instance and run `supabase db push` → confirm all migrations apply without errors
