# OKFARM Remediation & Migration Walkthrough

## Summary

Completed **Phase 1 (Security Hardening)** and **Phase 2 (Data Integrity)** remediation from the [audit report](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/docs/reviews/okfarm-dist-review.md), then migrated the full schema to a new Supabase environment and bootstrapped the production setup.

**Target:** `https://vvwnszvdbmdfhpatjnvz.supabase.co`

---

## Part 1 — Code Remediation

### 1.1 Database Migrations (4 files)

#### [Migration 1 — app_role enum fix](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308135817_33f88f0e-080c-49ff-adfa-b042951e3aa5.sql)
```diff
- CREATE TYPE public.app_role AS ENUM ('admin', 'assistant');
+ CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'assistant', 'viewer');
```
All 4 roles now recognized by RLS policies from initial schema creation.

#### [Migration 5 — no-op](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308164343_763a86dc-6b2f-4e7f-82a2-85ec8e4f4c8a.sql)
Replaced `ALTER TYPE ADD VALUE 'manager'` with `SELECT 1` since manager is now in the initial enum.

#### [Migration 7 — no-op](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308202500_efc9e98a-0d5e-4285-b5a3-a50c8df05119.sql)
Same treatment for the `viewer` role.

#### [Migration 22 — Remediation RPCs](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260614000000_remediation_phase1_phase2.sql) [NEW]
Three new server-side functions:
- `create_sale_with_items()` — Atomic sale + sale_items creation in one transaction
- `create_allocation_with_items()` — Atomic allocation + allocation_items creation
- `generate_vendor_code()` — Sequential vendor codes (`VND-00001`, `VND-00002`, ...)

---

### 1.2 Self-Registration Disabled (2 files)

#### [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Login.tsx)
- Removed the "Sign Up" tab — only login form remains
- Replaced `navigate()` in render body with `<Navigate />` component
- Added "Need an account? Contact your administrator." message
- Removed unused imports (`UserPlus`, `Tabs`, `Select`)

#### [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/contexts/AuthContext.tsx)
- Removed `signup()` function — the critical vulnerability that allowed self-assigned admin roles
- Removed `signup` from `AuthState` interface and context provider value

---

### 1.3 Vendor Onboarding Fixes (2 files)

#### [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorOnboarding.tsx)
- **NIN/BVN optional:** Removed from validation; label changed to "National ID (NIN/BVN)" without asterisk; `required` attribute removed
- **WebP image upload:** Photos converted to WebP (0.85 quality, max 1200px) via Canvas API and uploaded to Supabase Storage; only public URL stored in DB
- **Vendor code:** Now calls `generate_vendor_code()` RPC instead of `VND-${Date.now().slice(-6)}`

#### [imageUtils.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/lib/imageUtils.ts) [NEW]
- `convertToWebP()` — Canvas-based WebP conversion with configurable quality and max dimension
- `uploadImageToStorage()` — Supabase Storage upload returning public URL
- `processAndUploadImage()` — Convenience wrapper combining both

---

### 1.4 Transactional Data Writes (1 file)

#### [useSupabaseData.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useSupabaseData.ts)
- `useCreateSale` — Now calls `create_sale_with_items` RPC (single transaction, no orphaned records)
- `useCreateAllocation` — Now calls `create_allocation_with_items` RPC (single transaction)

---

### 1.5 Dashboard Fix (1 file)

#### [Dashboard.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Dashboard.tsx)
```diff
- { name: t('cash'), value: todayCash || 65, color: '...' },
- { name: t('outstanding'), value: totalOutstanding || 10, color: '...' },
+ { name: t('cash'), value: todayCash, color: '...' },
+ { name: t('outstanding'), value: totalOutstanding, color: '...' },
```
Shows real zero values instead of fake fallback data.

---

### 1.6 Edge Function Fix (2 files)

#### [admin-create-user/index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/functions/admin-create-user/index.ts)
```diff
- Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
+ Deno.env.get("SUPABASE_ANON_KEY")
```

#### [admin-link-vendor/index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/functions/admin-link-vendor/index.ts)
```diff
- Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")
+ Deno.env.get("SUPABASE_ANON_KEY")
```
Fixed because `SUPABASE_PUBLISHABLE_KEY` is a reserved prefix that cannot be set as a Supabase secret. `SUPABASE_ANON_KEY` is auto-provided by the runtime.

---

### 1.7 Environment Configuration (2 files)

#### [.env.example](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/.env.example) [NEW]
Template with placeholder values for new environment onboarding.

#### [.gitignore](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/.gitignore)
Added `.env`, `.env.local`, `.env.*.local` to prevent accidental key commits.

---

## Part 2 — Migration & Deployment

### 2.1 Database Migration
- **Command:** `npx supabase link --project-ref vvwnszvdbmdfhpatjnvz` → `npx supabase db push`
- **Result:** All 22 migrations applied successfully with zero errors
- **Verified:** `npx supabase migration list --linked` confirms all 22 local migrations match remote — zero drift

### 2.2 Edge Functions Deployed
- **Command:** `npx supabase functions deploy --project-ref vvwnszvdbmdfhpatjnvz`
- **Functions deployed (6):**
  - `admin-create-user` (58 KB)
  - `admin-link-vendor` (59 KB)
  - `check-overdue-payments` (122 KB)
  - `send-daily-digest` (104 KB)
  - `send-notification-email` (103 KB)
  - `verify-invoice` (23 KB)

### 2.3 Admin User Bootstrapped
- **Created via:** Supabase Auth Admin API (`POST /auth/v1/admin/users`)
- **User ID:** `002b20bc-31e5-4bc1-9043-d736e25af1d7`
- **Email:** `leonkouchica@gmail.com`
- **Role:** `admin` (inserted into `user_roles` table via REST API)
- **Profile:** Auto-created by database trigger

### 2.4 App Settings Configured
Inserted into `app_settings` via REST API:

| Key | Value |
|-----|-------|
| `edge_functions_url` | `https://vvwnszvdbmdfhpatjnvz.supabase.co/functions/v1` |
| `edge_functions_anon_key` | New project's anon key |
| `stock_recalc_threshold` | `10` (from migration 19) |

### 2.5 `.env` Updated
```
VITE_SUPABASE_PROJECT_ID="vvwnszvdbmdfhpatjnvz"
VITE_SUPABASE_URL="https://vvwnszvdbmdfhpatjnvz.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<new anon key>"
```

---

## Verification Results

| Check | Result |
|-------|--------|
| `vite build` | ✅ 3,357 modules, 0 errors |
| `supabase migration list --linked` | ✅ 22/22 migrations in sync |
| `supabase functions deploy` | ✅ 6/6 functions deployed |
| Admin user auth | ✅ Created with confirmed email |
| Admin role in `user_roles` | ✅ `role = 'admin'` |
| `app_settings` records | ✅ 3 rows configured |

---

## Files Changed Summary

| Category | Files | Type |
|----------|-------|------|
| Database migrations | 4 | 3 modified, 1 new |
| Frontend auth | 2 | Modified |
| Vendor onboarding | 1 | Modified |
| Image utilities | 1 | New |
| Data hooks | 1 | Modified |
| Dashboard | 1 | Modified |
| Edge functions | 2 | Modified |
| Environment config | 2 | 1 new, 1 modified |
| **Total** | **14** | |
