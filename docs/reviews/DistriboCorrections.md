# Distribo Corrections — Analysis & Review
**Date:** 2026-06-20  
**Reviewed by:** Antigravity (AI Assistant)  
**Status:** Awaiting Implementation Approval

---

## 1. 🏪 New Outlet — Pick Manager from Admin-Created Users

**Current state:** The "Manager" field in `OutletManagement.tsx` is a plain free-text `<Input>` — the name is typed manually.

**What it should be:** A dropdown `<Select>` populated from the `profiles` / `user_roles` table, filtered to users with the `manager` role — exactly the same data that `RoleManagement.tsx` already loads. The system already has the manager list; it just isn't wired into the Outlet form yet.

**Fix needed:** Replace the Manager text input with a Select that queries `profiles` joined with `user_roles WHERE role = 'manager'`.

**Files affected:**
- `src/pages/outlets/OutletManagement.tsx` — line 261

---

## 2. ⚠️ stockRecalc — `column reference "product_id" is ambiguous`

**Root cause:** The `recalculate_stock` SQL function (migration `20260507111226`) uses a `combined` CTE that `UNION`s all sub-CTEs (deliv, alloc, sold, recon, stock_levels). The final `SELECT` at the end does:

```sql
SELECT m.product_id, m.outlet_id, p.name, o.name ...
FROM mismatched m
LEFT JOIN products p ON p.id = m.product_id
LEFT JOIN outlets  o ON o.id = m.outlet_id
```

When PostgreSQL resolves `mismatched` (derived from `diff` which uses `USING (product_id, outlet_id)` joins), the column `product_id` becomes ambiguous between the CTE and the joined tables.

**Fix needed:** Qualify all column references in the `mismatched` CTE with explicit table aliases (e.g. `c.product_id` instead of bare `product_id`).

**Files affected:**
- `supabase/migrations/20260507111226_4fbf3c8f-bc09-40f0-bb56-568fb949e106.sql`
- A new migration will need to be written with `CREATE OR REPLACE FUNCTION`

---

## 3. 🖼️ Image Uploads — Convert to WebP with Compression

**Current state:** `InventoryInbound.tsx` uploads images directly to Supabase Storage with no compression or format conversion. The file extension is passed as-is.

**What's needed:** Before upload, use the browser's Canvas API (or `browser-image-compression` library) to:
1. Draw the image onto a canvas
2. Export it as `image/webp` with quality ~0.85
3. Upload the resulting `.webp` blob instead of the original file

This applies wherever file uploads happen: invoice images, delivery proof photos, and any other image inputs.

**Files affected:**
- `src/pages/inventory/InventoryInbound.tsx` — `handleFileUpload()` function (~line 99)
- `src/components/PhotoCapture.tsx` — for proof-of-delivery photos

---

## 4. 🔍 Inbound Stock — Product Not Selecting All / Button Audit

**Product Select issue:** `NewDeliveryDialog.tsx` loads all products via `useProducts()` and renders them in the dropdown — this should work. If the dropdown appears incomplete, the issue is likely that `useProducts()` is returning a filtered/limited dataset, or products haven't been added to the database.

**Button audit results:**

| Button | Status | Notes |
|--------|--------|-------|
| Add Item | ✅ Works | Adds a blank line item row |
| Remove item (trash) | ✅ Works | Correctly filters out the row |
| Save Delivery | ✅ Works | Validates and calls `createDelivery.mutateAsync()` |
| Product select dropdown | ⚠️ Partial | Only shows products in DB; incomplete if products missing |

**Known bug:** The `validItems` filter silently drops items where `product_id` is empty or `quantity === 0`. If no items pass validation, the delivery is still submitted with an **empty items array** — no error is shown to the user.

**Fix needed:** Add a validation check — if `validItems.length === 0`, show an error toast and block submission.

**Files affected:**
- `src/components/inventory/NewDeliveryDialog.tsx` — line 71

---

## 5. 💸 Grey Out Mobile Money

**Locations:**
- `src/pages/payments/MobileMoneyPayment.tsx` — the full Mobile Money page
- `src/pages/commissions/PayoutTracking.tsx` — the `handleDisburse` function hardcodes `method: 'mobile_money'`
- The Mobile Money entry in the sidebar navigation

**Fix needed:**
- Add a "Coming Soon" banner/overlay on the Mobile Money page
- Disable the sidebar nav link for Mobile Money with a badge
- Disable the Disburse button (see item #7 below)

---

## 6. 💰 USD Dollar Icons → Naira Icons

**`DollarSign` (Lucide icon) is used in 10+ files across the app.** Lucide does not have a native Naira icon.

| File | Context |
|------|---------|
| `src/pages/sales/SalesEntry.tsx` | KPI card "Total Sales" |
| `src/pages/sales/PaymentTracking.tsx` | KPI card "Total Paid" |
| `src/pages/inventory/InventoryInbound.tsx` | KPI card "Inventory Value" |
| `src/pages/allocation/DailyAllocation.tsx` | KPI card "Total All Time" |
| `src/pages/products/ProductManagement.tsx` | KPI card "Avg. Price" |
| `src/pages/vendor/VendorPortal.tsx` | Commission card |
| `src/components/layout/AppSidebar.tsx` | Sales nav icon |
| `src/pages/Dashboard.tsx` | Dashboard KPI card |

**Fix needed:** Create a shared `NairaIcon` component that renders a styled `₦` character (since Lucide has no Naira icon), and replace all `<DollarSign />` usages with it.

> **Note:** Currency values displayed in *text* already show `₦` correctly — only the KPI card icon components need updating.

---

## 7. ⛔ Grey Out Disburse Button on Payout Page

**Location:** `src/pages/commissions/PayoutTracking.tsx` — lines 91–96. The "Disburse" button renders for every pending commission.

**Fix needed:** Add `disabled` unconditionally (or conditionally based on a feature flag) and add a tooltip: *"Mobile Money integration coming soon"*. The button should appear greyed out and non-clickable.

---

## 8. ❓ Where Do Placed Orders Go? Do They Send Emails?

**Answer: No, orders do NOT send emails.**

When an order is submitted via `OrderPlacement.tsx`, it calls `createOrder.mutate(...)` which saves a record to the `orders` table in Supabase with `status: "pending"`. **That is all.** There is no email notification, no webhook, and no external trigger.

The order sits in the database with a lifecycle of:
```
pending → confirmed → in_transit → delivered
                ↓
            cancelled (at any stage)
```

**Recommendation:** Consider adding an email notification via a Supabase Edge Function (triggered on insert to `orders` table) to alert the relevant manager or admin when a new order is placed.

---

## 9. ❓ Where Do You Confirm Orders? Is It the Manager's Role?

**Yes — managers (and admins) confirm orders on the same Orders page.**

On the **Order History tab** of `OrderPlacement.tsx`, there is a status dropdown in the "Update" column. Any user who is not a `viewer` can change the status. The workflow is:

```
pending  →  [Confirm]  →  confirmed  →  [In Transit]  →  in_transit  →  [Delivered]  →  delivered
   └──────────────────────────────────────────[Cancel]──────────────────────────────────────────┘
```

A manager logs in, goes to **Orders → Order History**, finds the pending order, and uses the dropdown to confirm it. There is **no separate "Confirm Orders" page** — it is embedded within the Orders page itself.

**Recommendation:** Add a dedicated "Pending Orders" KPI card on the manager's dashboard, or a filtered "Needs Attention" view, so managers are immediately aware of new orders without having to navigate to the Orders page manually.

---

## 10. 🏗️ Under Depots — Grey Out the Add Depot Button

**Location:** `src/pages/depots/DepotManagement.tsx` — line 74.

**Current state:** The button already uses `{...viewerProps}` so `viewer` role users cannot click it. However, to disable it for **all roles** temporarily (pending a business decision on depot creation process), `disabled` needs to be added unconditionally.

**Fix needed:** Add `disabled` and optionally a tooltip: *"Contact admin to add depots"*.

---

## 11. ❓ Inbound Stock — What Happens When You Click "Adjust Stock" and Submit?

**Exact flow:**

1. The **"Adjust Stock"** button on the Inventory page (`InventoryInbound.tsx`) opens `NewDeliveryDialog` (internally labelled *"Record New Delivery"*).
2. You fill in: Invoice Number, Date, Credit Term, Notes, and add product line items with quantities.
3. On submit, `createDelivery.mutateAsync()` is called, which:
   - Creates a record in `inbound_deliveries` with `status: 'pending'`
   - Creates child records in `delivery_items` for each line item
4. **Stock is NOT immediately updated.** The delivery stays `"pending"` until someone clicks **"Mark Received"** in the delivery list.
5. Only **after marking received** does the delivery factor into stock levels (via the `recalculate_stock` admin function).

> ⚠️ **Labelling issue:** The "Adjust Stock" button label is misleading. It actually creates a *delivery record*, not a direct stock adjustment. Clicking "Adjust Stock" → filling in quantities → saving does NOT change your current stock totals until the delivery is marked received. True direct stock correction happens through the **StockRecalc** admin tool (`/stock-recalc`).

**Recommendation:** Rename the button to **"Record Delivery"** or **"New Inbound Delivery"** to avoid confusion.

---

## Summary Table

| # | Item | Type | Priority | Ready to Code? |
|---|------|------|----------|----------------|
| 1 | Outlet Manager Dropdown | Enhancement | Medium | ✅ Yes |
| 2 | stockRecalc SQL Error | Bug Fix | High | ✅ Yes |
| 3 | Image → WebP Conversion | Enhancement | Medium | ✅ Yes |
| 4 | Inbound Stock Product Select | Bug Fix | Medium | ✅ Yes |
| 5 | Grey out Mobile Money | UI Change | Low | ✅ Yes |
| 6 | Dollar → Naira Icons | UI Change | Low | ✅ Yes |
| 7 | Grey out Disburse Button | UI Change | Low | ✅ Yes |
| 8 | Where orders go (Q&A) | Answered | — | ⚠️ Needs email feature |
| 9 | How to confirm orders (Q&A) | Answered | — | ⚠️ Needs dashboard widget |
| 10 | Grey out Add Depot Button | UI Change | Low | ✅ Yes |
| 11 | What Adjust Stock does (Q&A) | Answered | — | ⚠️ Rename button recommended |
