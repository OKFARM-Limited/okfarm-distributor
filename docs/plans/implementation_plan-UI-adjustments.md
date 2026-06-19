# Implementation Plan - UI Redesign Audit & Alignment

Run a comprehensive audit on the entire application, identify pages that do not match the new redesigned UI pattern, fix the non-compliant pages, and compile a final audit report with before/after visual verification.

## User Review Required

> [!IMPORTANT]
> The test credentials `leekouchica@gmail.com` / `Adewale83@#` have the `assistant` role, which redirects them to `/` when trying to access admin-only routes (e.g., `forecast`, `commissions`, `payouts`, `orders`, `settlement`, `outlets`, `depots`, `products`).
> We will verify compliance of these admin pages via code-level inspection and by temporarily simulating the admin role locally during browser subagent sessions.

> [!NOTE]
> Admin utility pages in `src/pages/admin/` (like `PermissionsMatrix.tsx`, `RoleManagement.tsx`, `StockRecalc.tsx`, `BulkImport.tsx`) are secondary developer/admin-only tools. We will apply the standard layout (headers, spacing, title structure) to make them consistent, but they do not require complex custom KPI cards unless relevant data exists.

## Proposed Changes

We will inspect and modify all remaining pages that failed the initial automated check or were not fully redesigned.

### UI Consistency fixes

#### [MODIFY] [VendorDetail.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendor/VendorDetail.tsx)
- Add standard page header with `h1` title, `p` subtitle, and `space-y-5 animate-fade-in` container.

#### [MODIFY] [VendorPerformance.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/performance/VendorPerformance.tsx)
- Reorganize header structure with standard title/subtitle, and apply `space-y-5 animate-fade-in` container.

#### [MODIFY] [VendorMap.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/map/VendorMap.tsx)
- Add a descriptive subtitle beneath the page title. Ensure `space-y-5` container.

#### [MODIFY] [MobileMoneyPayment.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/payments/MobileMoneyPayment.tsx)
- Apply page title, descriptive subtitle, and spacing consistency.

#### [MODIFY] [NotificationPreferences.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/notifications/NotificationPreferences.tsx)
- Add subtitle and wrap with `space-y-5 animate-fade-in` container.

#### [MODIFY] [VendorOnboarding.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendor/VendorOnboarding.tsx)
- Update header to include title, subtitle, spacing and animation.

#### [MODIFY] [VendorPortal.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendor/VendorPortal.tsx)
- Ensure title, dynamic subtitle, and standard inner page spacing.

#### [MODIFY] [BarcodeScanner.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/inventory/BarcodeScanner.tsx)
- Align with the standard interior page layout.

#### [MODIFY] [BulkImport.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/admin/BulkImport.tsx)
- Update page layout wrapper and header details.

#### [MODIFY] [StockRecalc.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/admin/StockRecalc.tsx)
- Ensure title, subtitle, and spacing are consistent.

#### [MODIFY] [PermissionsMatrix.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/admin/PermissionsMatrix.tsx)
- Align with the standard interior page layout.

#### [MODIFY] [RoleManagement.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/admin/RoleManagement.tsx)
- Ensure header details, subtitle, and layout spacing are consistent.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Dashboard.tsx)
- Add `md:grid-cols-3 lg:grid-cols-5` to the top KPI grid to prevent uneven row wrapping on mid-size viewports.

#### [MODIFY] [PaymentTracking.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/sales/PaymentTracking.tsx)
- Polish simple data list container to look like a premium table card with borders.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure TypeScript compilation passes.

### Manual Verification
- Check all modified pages using code inspection.
- Generate a new, comprehensive `ui_audit_report.md` marking every file in `src/pages/` as either compliant, exempt (e.g. auth/not-found/routing), or needing adjustments.
- Use targeted screenshots via browser subagent of redesigned pages.
