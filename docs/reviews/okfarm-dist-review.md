# OKFARM Distributor Manager — Full Codebase Audit

**Audit Date:** 14 June 2026  
**Auditor:** AI Code Review  
**Codebase:** `OKFARM-Limited/okfarm-distributor`  
**Commit State:** As of audit date (local workspace)

---

## 1. Application Overview

### What the App Is
OKFARM Distributor Manager is a **Progressive Web Application (PWA)** built for **FanMilk Nigeria** distributors to manage their entire daily operations — from vendor workforce management through product allocation, sales tracking, payment reconciliation, commissions, and inventory forecasting.

The app is designed for a **multi-outlet** distributor organization, where an admin oversees multiple outlet branches, each with managers, assistants, and field vendors who sell FanMilk products (ice cream, yogurt, etc.) via push-carts, bicycles, and tricycles.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript (Vite) |
| UI Library | shadcn/ui + Radix primitives + Tailwind CSS 3 |
| State/Data | TanStack React Query + Supabase JS Client |
| Backend / Database | Supabase (PostgreSQL, Auth, Edge Functions, Realtime) |
| Charts | Recharts |
| Maps | Leaflet + React-Leaflet |
| PDF | jsPDF + jspdf-autotable |
| QR/Barcode | html5-qrcode |
| PWA | vite-plugin-pwa (Workbox) |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Testing Library |
| i18n | Custom translation system (English, Yoruba, Pidgin) |
| Origin | Lovable.dev (AI-scaffolded project) |

### Architecture
- **SPA** with `react-router-dom` v6 (nested routes under `AppLayout`)
- **4-role RBAC**: admin, manager, assistant, viewer
- **Multi-outlet context**: Global outlet selector filters all data views
- **Offline-first**: IndexedDB queue for sales/allocations when offline
- **Realtime**: Supabase Postgres Changes subscription for live data sync
- **6 Edge Functions**: Admin user management, vendor linking, payment checks, daily digest, email notifications, invoice verification

---

## 2. Complete Feature Inventory

### 2.1 Authentication & Authorization
| Feature | Route | Status |
|---------|-------|--------|
| Email/password login | `/login` | ✅ Implemented |
| Self-registration with role | `/login` (Sign Up tab) | ✅ Implemented |
| Session persistence | — | ✅ Supabase auto-refresh |
| Role-based route guards | `ProtectedRoute`, `AdminRoute`, `AdminOnlyRoute` | ✅ Implemented |
| Client-side permissions matrix | `usePermissions` hook | ✅ Implemented |
| Viewer read-only mode | `ViewerGuard`, `ViewerBanner` | ✅ Implemented |

### 2.2 Dashboard
| Feature | Route | Status |
|---------|-------|--------|
| KPI cards (vendors, sales, cash, outstanding) | `/` | ✅ Implemented |
| Low stock alerts panel | `/` | ✅ Implemented |
| Outlets overview (company-wide) | `/` | ✅ Implemented |
| 14-day sales trend (line chart) | `/` | ✅ Implemented |
| Weekly sales (bar chart) | `/` | ✅ Implemented |
| Payment breakdown (pie chart) | `/` | ✅ Implemented |
| Top 5 performers | `/` | ✅ Implemented |
| Realtime data refresh | — | ✅ Via `useRealtimeSubscription` |

### 2.3 Vendor Management
| Feature | Route | Status |
|---------|-------|--------|
| Vendor list with search/filter | `/vendors` | ✅ Implemented |
| Vendor detail view | `/vendors/:id` | ✅ Implemented |
| Vendor onboarding (4-tab form) | `/vendors/onboard` | ✅ Implemented |
| Photo upload (client-side preview) | `/vendors/onboard` | ✅ Implemented |
| Personal / Identity / Financial / Work tabs | `/vendors/onboard` | ✅ Implemented |
| Vendor portal link/create | `/vendors/:id` via VendorAuthLink | ✅ Implemented |

### 2.4 Asset Management
| Feature | Route | Status |
|---------|-------|--------|
| Asset list (push carts, bicycles, tricycles) | `/assets` | ✅ Implemented |
| Condition tracking (good/fair/poor) | `/assets` | ✅ Implemented |
| Maintenance scheduling | `/assets` | ✅ Schema exists |
| Assignment to vendors | `/assets` | ✅ Implemented |

### 2.5 Daily Operations
| Feature | Route | Status |
|---------|-------|--------|
| Daily allocation (products → vendor) | `/allocation` | ✅ Implemented |
| Reconciliation (sold/returned/spoiled) | `/reconciliation` | ✅ Implemented |
| Allocation history | `/allocation/history` | ✅ Implemented |
| Vendor check-in/check-out | `/checkin` | ✅ Implemented |
| Sales entry with product line items | `/sales` | ✅ Implemented |
| Offline queuing for sales/allocations | — | ✅ Via `useOfflineQueue` |
| CSV export (sales) | `/sales` | ✅ Implemented |
| PDF export (sales) | `/sales` | ✅ Implemented |

### 2.6 Payments & Finance
| Feature | Route | Status |
|---------|-------|--------|
| Payment tracking | `/payments` | ✅ Implemented |
| Mobile money payments | `/mobile-money` | ✅ Implemented |
| Dues statement | `/dues` | ✅ Implemented |
| Commission calculator (RPC) | `/commissions` | ✅ Implemented |
| Payout tracking & disbursement | `/payouts` | ✅ Implemented |
| Monthly settlement | `/settlement` | ✅ Implemented |

### 2.7 Inventory & Supply Chain
| Feature | Route | Status |
|---------|-------|--------|
| Inbound delivery management | `/inventory` | ✅ Implemented |
| Stock level monitoring | `/inventory` | ✅ Implemented |
| Barcode scanner (html5-qrcode) | `/scanner` | ✅ Implemented |
| Forecast & reorder suggestions | `/forecast` | ✅ Implemented |
| Order placement to suppliers | `/orders` | ✅ Implemented |

### 2.8 Performance & Analytics
| Feature | Route | Status |
|---------|-------|--------|
| Performance dashboard | `/performance` | ✅ Implemented |
| Individual vendor performance | `/performance/:vendorId` | ✅ Implemented |
| Vendor map (Leaflet) | `/map` (imported as VendorMap) | ✅ Implemented |

### 2.9 Programs
| Feature | Route | Status |
|---------|-------|--------|
| Incentive programs | `/incentives` | ✅ Implemented |
| Fan Academy (training modules) | `/training` | ✅ Implemented |
| Vendor self-service portal | `/my-portal` | ✅ Implemented |

### 2.10 Admin
| Feature | Route | Status |
|---------|-------|--------|
| Role management (with Create User) | `/roles` | ✅ Implemented |
| Permissions matrix view | `/permissions` | ✅ Implemented |
| Stock recalculation | `/stock-recalc` | ✅ Implemented |
| Bulk CSV import (vendors/products) | `/bulk-import` | ✅ Implemented |
| Audit trail | `/audit` | ✅ Implemented |

### 2.11 System
| Feature | Route | Status |
|---------|-------|--------|
| Settings (theme, language, profile) | `/settings` | ✅ Implemented |
| Notification center | `/notifications` | ✅ Implemented |
| Notification preferences | `/settings/notifications` | ✅ Implemented |
| Dark mode toggle | — | ✅ Via ThemeContext |
| i18n (English, Yoruba, Pidgin English) | — | ✅ Via LanguageContext |
| PWA (installable, offline caching) | — | ✅ Via vite-plugin-pwa |
| Offline indicator | — | ✅ Via OfflineIndicator component |
| Web push notifications (local) | — | ✅ Via useWebPush hook |

### 2.12 Edge Functions (Supabase)
| Function | Purpose | Status |
|----------|---------|--------|
| `admin-create-user` | Server-side user creation | ✅ Exists |
| `admin-link-vendor` | Link vendor to auth account | ✅ Exists |
| `check-overdue-payments` | Flag overdue payments | ✅ Exists |
| `send-daily-digest` | Daily email summary | ✅ Exists |
| `send-notification-email` | Email notifications | ✅ Exists |
| `verify-invoice` | Invoice verification | ✅ Exists |

### 2.13 Database Schema
21 migrations defining 25+ tables including: `outlets`, `vendors`, `products`, `assets`, `depots`, `allocations`, `allocation_items`, `sales`, `sale_items`, `check_ins`, `reconciliations`, `reconciliation_items`, `payments`, `commissions`, `payouts`, `settlements`, `settlement_lines`, `orders`, `order_items`, `inbound_deliveries`, `delivery_items`, `stock_levels`, `forecasts`, `notifications`, `notification_preferences`, `audit_logs`, `incentive_programs`, `vendor_incentives`, `training_modules`, `vendor_training_progress`, `import_batches`, `app_settings`, `user_roles`, `profiles`.

---

## 3. Audit Findings — Gaps, Errors & Issues

### 3.1 🔴 CRITICAL — Security Issues

#### SEC-01: Self-Registration Allows Arbitrary Role Assignment
**File:** [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Login.tsx#L41-L56)  
**Issue:** The Sign Up form allows any user to select their own role (including `admin`) when creating an account. The `signup()` function directly inserts the chosen role into `user_roles`.  
**Impact:** Any anonymous visitor can create an admin account and gain full system access.  
**Remediation:** 
- Remove the role selector from the public sign-up form entirely
- Default new sign-ups to `viewer` or `assistant`
- Only allow admins to assign roles via `admin-create-user` edge function
- Add a server-side RLS policy that restricts `user_roles` INSERT to admins only

#### SEC-02: .env File Contains Supabase Keys in Version Control
**File:** [.env](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/.env)  
**Issue:** The `.env` file with Supabase URL and anon key is committed to the repository (not in `.gitignore`).  
**Impact:** While the anon key is technically public, committing `.env` sets a bad precedent and risks accidental exposure of future service-role keys.  
**Remediation:**
- Add `.env` to `.gitignore`
- Use `.env.example` with placeholder values
- Ensure no service-role keys are ever committed

#### SEC-03: RLS Policies Only Recognize `admin` and `assistant` Roles
**File:** [Initial migration](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/supabase/migrations/20260308135817_33f88f0e-080c-49ff-adfa-b042951e3aa5.sql#L16-L17)  
**Issue:** The `app_role` enum is defined as `('admin', 'assistant')` but the frontend uses 4 roles: `admin`, `manager`, `assistant`, `viewer`. The `has_role()` function only checks for `admin` or `assistant` — `manager` and `viewer` roles are not recognized at the database level.  
**Impact:** Managers and viewers bypass RLS because their roles aren't in the enum. All RLS policies checking `has_role(uid, 'admin')` won't match managers. Managers inserting data (sales, allocations) may be silently denied by RLS.  
**Remediation:**
- Alter the `app_role` enum to include `manager` and `viewer`
- Update RLS policies to recognize all 4 roles appropriately
- Add a migration to fix existing `user_roles` rows

#### SEC-04: RLS Policies Too Permissive for Write Operations
**Issue:** Many tables (e.g., `sales`, `allocations`, `payments`) allow `assistant` role to INSERT/UPDATE but there's no RLS for `manager` role (since it's not in the enum). The `has_role` function is the only gating mechanism.  
**Impact:** If a later migration added open policies (common in Lovable projects), data may be writeable by any authenticated user regardless of role.  
**Remediation:** Audit all 21 migrations for RLS coverage; ensure every table has explicit SELECT/INSERT/UPDATE/DELETE policies matching the 4-role model.

---

### 3.2 🟠 HIGH — Functional & Data Integrity Issues

#### FUNC-01: Vendor Photo Not Uploaded to Storage
**File:** [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorOnboarding.tsx#L43-L50)  
**Issue:** Photo is read as a base64 data URL and saved directly to the `photo_url` field. This stores the entire image blob as a text string in the database.  
**Impact:** Database bloat, performance degradation, potential row size limits exceeded.  
**Remediation:** Upload photos to Supabase Storage, save only the public URL in `photo_url`.

#### FUNC-02: Vendor Code Generation Uses Timestamp (Non-Unique)
**File:** [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorOnboarding.tsx#L59)  
**Issue:** `vendor_code = 'VND-' + Date.now().toString().slice(-6)` — only last 6 digits of timestamp, can collide if two vendors are created within the same second.  
**Impact:** Potential unique constraint violations; vendor creation failures.  
**Remediation:** Use a proper sequential or UUID-based code, or a server-side auto-increment pattern.

#### FUNC-03: Non-Transactional Multi-Table Inserts
**Files:** [useSupabaseData.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useSupabaseData.ts) — multiple hooks (useCreateAllocation, useCreateSale, useCreateReconciliation, useCreateOrder, etc.)  
**Issue:** Parent + child records (e.g., `sales` + `sale_items`) are inserted as separate API calls without database transactions. If the child insert fails, the parent record exists as an orphan.  
**Impact:** Data inconsistency — orphaned header records with no line items.  
**Remediation:** Use Supabase RPC functions to wrap inserts in PostgreSQL transactions, or use a single edge function per operation.

#### FUNC-04: `useUpdateOrder` Uses `Record<string, any>` Casting
**File:** [useSupabaseData.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useSupabaseData.ts#L445)  
**Issue:** `Record<string, any>` type bypass allows arbitrary fields to be sent, defeating TypeScript safety.  
**Impact:** Runtime errors if wrong fields are sent; potential security risk if unexpected columns are written.  
**Remediation:** Use proper `TablesUpdate<'orders'>` types consistently.

#### FUNC-05: Dashboard Payment Breakdown Uses Hardcoded Fallbacks
**File:** [Dashboard.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Dashboard.tsx#L50-L52)  
**Issue:** `{ name: t('cash'), value: todayCash || 65, color: ... }` — when `todayCash` is 0 (legitimate value), the fallback of `65` is shown.  
**Impact:** Misleading data on dashboard when there genuinely are zero sales.  
**Remediation:** Remove the `|| 65` and `|| 10` fallbacks; show 0 when there are no sales.

#### FUNC-06: Offline Queue Only Handles Sales & Allocations
**File:** [useOfflineQueue.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useOfflineQueue.ts#L9-L11)  
**Issue:** `QueueOp` type only supports `'sale'` and `'allocation'` operations. Payments, check-ins, reconciliations, and other critical operations cannot be queued offline.  
**Impact:** Field staff lose data for non-sale operations when connectivity drops.  
**Remediation:** Extend `QueueOp` to support all critical field operations (payments, check-ins, reconciliations).

---

### 3.3 🟡 MEDIUM — Architecture & Design Issues

#### ARCH-01: Massive `useSupabaseData.ts` (654 Lines, 30+ Hooks)
**File:** [useSupabaseData.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useSupabaseData.ts)  
**Issue:** All data hooks for every entity are in a single file. This creates a maintenance burden and makes code navigation difficult.  
**Impact:** Hard to maintain, test, or refactor individual data concerns.  
**Remediation:** Split into domain-specific hook files: `useVendorData.ts`, `useSalesData.ts`, `useInventoryData.ts`, etc.

#### ARCH-02: Realtime Subscription Ignores Table Filter Parameter
**File:** [useRealtimeSubscription.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/hooks/useRealtimeSubscription.ts#L20-L34)  
**Issue:** The hook accepts a `tables` array parameter but subscribes to `schema: 'public'` with `event: '*'` — it listens to ALL tables regardless of the parameter. The `tables` parameter only affects the `useEffect` dependency.  
**Impact:** Unnecessary query invalidations for unrelated table changes; wasted bandwidth.  
**Remediation:** Either filter the subscription by table name or use per-table channels.

#### ARCH-03: Duplicate Vendor Pages Directory
**Files:** `src/pages/vendor/` (VendorPortal) vs `src/pages/vendors/` (VendorList, VendorDetail, VendorOnboarding)  
**Issue:** Two separate directories for vendor-related pages with confusingly similar names.  
**Impact:** Developer confusion; harder to navigate.  
**Remediation:** Consolidate into a single `src/pages/vendors/` directory.

#### ARCH-04: No Error Boundary
**Issue:** No React Error Boundary component exists. Unhandled render errors crash the entire app.  
**Impact:** A single component error takes down the whole UI.  
**Remediation:** Add Error Boundary components at route and layout levels.

#### ARCH-05: Client-Side Permission Checks Only — No Server-Side Enforcement  
**Issue:** The `usePermissions` hook enforces RBAC purely on the client. The database RLS doesn't mirror the 4-role, feature-level matrix.  
**Impact:** A technically savvy user can call Supabase APIs directly bypassing frontend guards.  
**Remediation:** Implement server-side RLS policies that match the frontend permission matrix.

#### ARCH-06: OutletContext Fetches All Outlets on Every Page Load
**File:** [OutletContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/contexts/OutletContext.tsx#L18)  
**Issue:** `useOutlets()` is called inside `OutletProvider` which wraps the entire app — it fires on initial load for every user, even if they only need one outlet.  
**Impact:** Unnecessary API call for single-outlet deployments; minor perf concern.  
**Remediation:** This is acceptable for the current scale but could be lazy-loaded.

---

### 3.4 🔵 LOW — Code Quality & Polish Issues

#### QUAL-01: Extensive Use of `any` Type
**Files:** Multiple pages — Dashboard, VendorList, VendorPortal, useUpdateDelivery, useCreateDelivery, useUpdateOrder, BulkImport  
**Issue:** Heavy use of `as any` casts, `Record<string, any>`, and untyped variables throughout the codebase.  
**Impact:** Reduced type safety; harder to catch bugs at compile time.  
**Remediation:** Replace `any` with proper types from Supabase-generated `types.ts`.

#### QUAL-02: No Real Tests
**File:** [example.test.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/test/example.test.ts)  
**Issue:** Only a single placeholder test (`expect(true).toBe(true)`). No unit, integration, or component tests exist.  
**Impact:** No automated regression protection; changes can silently break features.  
**Remediation:** Add tests for critical paths: authentication flow, sales entry, commission calculation, offline queue, permission checks.

#### QUAL-03: Inconsistent i18n Coverage
**Issue:** Some pages use the `t()` translation function extensively (Dashboard, navigation) while many pages have hardcoded English strings (Sales Entry, Vendor Onboarding, Admin pages, etc.).  
**Impact:** Yoruba/Pidgin users see a mix of translated and English text.  
**Remediation:** Run a full audit of all user-facing strings; add missing translation keys.

#### QUAL-04: Login Page Uses `navigate()` in Render Body
**File:** [Login.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Login.tsx#L24-L27)  
**Issue:** `if (isAuthenticated) { navigate('/'); return null; }` is called during render, which can cause React warnings about state updates during render.  
**Impact:** Potential flash/flicker; React strict-mode warnings.  
**Remediation:** Use `<Navigate to="/" replace />` instead, or move to a `useEffect`.

#### QUAL-05: PWA Icons Are Identical
**Files:** `public/pwa-192x192.png` (13,942 bytes) and `public/pwa-512x512.png` (13,942 bytes)  
**Issue:** Both PWA icon files are exactly the same size — likely the same image served as both resolutions.  
**Impact:** The 512x512 icon may appear blurry on high-res devices if it's actually a 192px image.  
**Remediation:** Generate proper resolution-specific icons.

#### QUAL-06: `index.html` Disables User Scaling
**File:** [index.html](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/index.html#L5)  
**Issue:** `maximum-scale=1.0, user-scalable=no` prevents pinch-to-zoom.  
**Impact:** Accessibility issue; violates WCAG 2.1 guideline 1.4.4 (Resize Text).  
**Remediation:** Remove `user-scalable=no` and `maximum-scale=1.0`.

#### QUAL-07: No Loading/Error States on Some Pages
**Issue:** While the Dashboard and SalesEntry have loading states, not all pages handle loading and error states from their data hooks consistently.  
**Impact:** Users may see blank screens or layout shifts during data fetching.  
**Remediation:** Add consistent loading spinners and error displays to all data-fetching pages.

#### QUAL-08: Hardcoded Nigerian Territories & Banks
**File:** [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorOnboarding.tsx#L19-L20)  
**Issue:** Territories (`'Ikeja', 'Lekki', ...`) and banks are hardcoded arrays, not configurable.  
**Impact:** Adding new territories/banks requires a code deployment.  
**Remediation:** Move to a database-driven configuration or `app_settings` table.

#### QUAL-09: AuthContext Race Condition
**File:** [AuthContext.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/contexts/AuthContext.tsx#L63-L89)  
**Issue:** Both `onAuthStateChange` and `getSession` can set the user, potentially causing a double state update. The `setTimeout` workaround (line 68) indicates awareness of a deadlock issue but introduces a timing-dependent race.  
**Impact:** Potential brief flash of unauthenticated state; loading flicker.  
**Remediation:** Use a single source of truth for session initialization; consider removing the `setTimeout` and using the auth listener exclusively.

---

## 4. Summary Scorecard

| Category | Score | Assessment |
|----------|-------|-----------|
| **Feature Completeness** | ⭐⭐⭐⭐⭐ | Excellent — 35+ features across 12 domains, all routes implemented |
| **Security** | ⭐⭐ | Critical gaps — open self-registration with role selection, RLS enum mismatch |
| **Data Integrity** | ⭐⭐⭐ | Non-transactional writes, vendor code collisions possible |
| **Code Quality** | ⭐⭐⭐ | Consistent patterns but heavy `any` usage, monolithic data hook |
| **Testing** | ⭐ | No real tests exist |
| **Accessibility** | ⭐⭐ | Zoom disabled, no ARIA attributes observed |
| **Performance** | ⭐⭐⭐⭐ | Good — PWA caching, offline queue, lazy imports for PDF |
| **i18n** | ⭐⭐⭐ | 3 languages supported but inconsistent coverage |
| **Offline Support** | ⭐⭐⭐ | Sales/allocations queued; other operations not covered |
| **Documentation** | ⭐⭐ | Only default Lovable README; no API docs, architecture docs, or runbooks |

---

## 5. Prioritized Remediation Roadmap

### Phase 1 — Security Hardening (Immediate)
1. **Disable self-registration entirely** — Remove the Sign Up tab from the login page; only admins can create user accounts via the Role Management page or `admin-create-user` edge function
2. **Fix `app_role` enum** — Add `manager` and `viewer` to PostgreSQL enum
3. **Audit all RLS policies** — Ensure 4-role enforcement at DB level
4. **Add `.env` to `.gitignore`** — Use `.env.example` for onboarding
5. **Add password strength validation** — Min 8 chars, complexity rules

### Phase 2 — Data Integrity (Next Sprint)
6. **Wrap multi-table inserts in transactions** — Use Supabase RPCs or edge functions
7. **Fix vendor code generation** — Use UUID or server-side sequence
8. **Convert uploaded images to WebP format** — All vendor photos and proof-of-delivery images should be client-side converted to WebP before uploading to Supabase Storage; preserve image quality while achieving significant size reduction (~30-50% smaller than JPEG). Store only the public URL in the database, not base64 blobs
9. **Make NIN/BVN confirmation optional** — Remove the `required` attribute from the National ID (NIN) field on the Vendor Onboarding form; NIN/BVN should be collected when available but should not block vendor registration
10. **Remove dashboard hardcoded fallbacks** — Show real zero values
11. **Add Error Boundaries** — Prevent full-app crashes

### Phase 3 — Quality & Testing (Ongoing)
12. **Add unit tests** — Auth flow, permissions, offline queue, commission calc
13. **Add E2E tests** — Sales flow, vendor onboarding, role management
14. **Replace `any` types** — Use generated Supabase types throughout
15. **Complete i18n coverage** — All user-facing strings through `t()` function
16. **Split `useSupabaseData.ts`** — One hook file per domain

### Phase 4 — Polish & Accessibility
17. **Remove `user-scalable=no`** — Accessibility compliance
18. **Add loading/error states** — All pages consistently
19. **Fix PWA icons** — Proper resolution assets
20. **Make territories/banks configurable** — Via `app_settings` table
21. **Extend offline queue** — Add payments, check-ins, reconciliations

---

## 6. Conclusion

The OKFARM Distributor Manager is a **feature-rich, well-architected application** that covers an impressive breadth of distributor operations. The codebase demonstrates strong use of modern React patterns (hooks, context, React Query), a well-designed database schema with 25+ tables, and thoughtful features like offline support, real-time sync, and multi-language support.

However, the app has **critical security vulnerabilities** that must be addressed before production use — particularly the open role self-assignment during registration and the RLS/enum mismatch that leaves the `manager` and `viewer` roles unrecognized at the database level. Data integrity concerns around non-transactional writes and the complete absence of automated tests also need urgent attention.

The recommended approach is to tackle security hardening immediately (Phase 1), then address data integrity in the next sprint, while building out testing and code quality improvements incrementally.
