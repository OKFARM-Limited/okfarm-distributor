# Implementation Plan — Mobile PWA Full UI Redesign

Match the mobile UI exactly to the 9 reference screens provided in `docs/UI reference/mobile pwa/`. The desktop layout must remain completely unchanged.

---

## What the Reference Images Show

### Structure across all screens:
1. **Mobile TopBar** — Hamburger (☰) | Logo (Distribo) | Notification Bell (with badge) | User Avatar circle — all on a single row
2. **7-Tab Bottom Navigation** — Dashboard | Operations | Inventory | Finance | Analytics | Programs | Admin
3. **Hub Pages** — Operations, Inventory, Finance, Analytics, Programs, and Admin each render a **grouped icon-list menu** instead of the full data tables that exist on desktop
4. **Dashboard** — "Hi, Leon! 👋" header with Download Report button, 2×2 + 1 KPI grid, Sales Overview chart, Sales by Outlet donut, and 3 Quick Action buttons (Add Outlet / Add Product / Record Sale) above the bottom nav
5. **Dark Mode** — Full dark equivalent shown with same structure; user wants a **toggle switch** in the mobile top bar

---

## Proposed Changes

### Component: `TopBar.tsx`
#### [MODIFY] [TopBar.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/TopBar.tsx)
- On mobile (`md:hidden` for desktop elements, new mobile row at `block md:hidden`):
  - Show: `☰` hamburger (SidebarTrigger) | Distribo logo/wordmark | spacer | Bell icon with red badge | User Avatar
  - **Remove** outlet selector, date, and theme button from the mobile view
  - **Add a dark mode toggle switch** (sun/moon icon) next to the notification bell in the mobile top bar
- Desktop view remains exactly as-is

---

### Component: `BottomBar.tsx`
#### [MODIFY] [BottomBar.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/BottomBar.tsx)
- Change from 5 tabs to **7 tabs** matching the reference:
  1. **Dashboard** → `/` (Home icon)
  2. **Operations** → `/mobile/operations` (Layers/Stack icon)
  3. **Inventory** → `/mobile/inventory` (Package/Box icon)
  4. **Finance** → `/mobile/finance` (Wallet/CreditCard icon)
  5. **Analytics** → `/mobile/analytics` (BarChart icon)
  6. **Programs** → `/mobile/programs` (Gift icon)
  7. **Admin** → `/mobile/admin` (Shield icon — only visible if admin/manager)
- Active tab shows blue label + blue icon
- Slightly smaller icons and labels to fit 7 tabs

---

### New Pages: Mobile Hub Pages
Each page renders a title, subtitle, then a card list of icon rows with `chevron-right` — exactly matching the reference images.

#### [NEW] `src/pages/mobile/MobileOperations.tsx`
Items: Vendors · Check-in · Assets · Allocation · Reconciliation · Allocation History

#### [NEW] `src/pages/mobile/MobileInventory.tsx`
Items: Inbound Stock · Scanner

#### [NEW] `src/pages/mobile/MobileFinance.tsx`
Items: Sales Entry · Payments · Mobile Money · Dues Statement

#### [NEW] `src/pages/mobile/MobileAnalytics.tsx`
Items: Performance · Vendor Maps

#### [NEW] `src/pages/mobile/MobilePrograms.tsx`
Items: Incentives · Fan Academy

#### [NEW] `src/pages/mobile/MobileAdmin.tsx`
Items: Outlets · Products · Commissions · Payouts · Orders · Forecast · Settlement · Depots · Audit Trail · User Roles · Permissions · stockRecalc · Bulk Import

Each item has a **coloured rounded icon** background (like the reference), title, subtitle, and chevron. Tapping navigates to the corresponding route.

---

### Page: Dashboard
#### [MODIFY] `src/pages/Dashboard.tsx`
On mobile only:
- Replace the greeting with **"Hi, [FirstName]! 👋 / Here's what's happening today."**
- Add 3 **Quick Action buttons** (Add Outlet / Add Product / Record Sale) directly above the bottom nav bar (inside the page scroll, at the bottom of the content)
- These are displayed in a horizontal 3-column row matching the reference

---

### Routes: `src/App.tsx`
#### [MODIFY] [App.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/App.tsx)
- Add routes for the 6 new mobile hub pages under `/mobile/*`

---

### Shared Utility: `MobileMenuItem.tsx`
#### [NEW] `src/components/mobile/MobileMenuItem.tsx`
A reusable row component used by all hub pages: icon with colour + title + description + chevron.

---

## Dark Mode Toggle in Mobile TopBar

> [!IMPORTANT]
> The reference images show the full dark equivalent of the app. The user explicitly wants a **toggle** at the top for dark/light mode on mobile. We will add a **Sun/Moon icon button** in the mobile TopBar (right of the Distribo logo, before the bell). This uses the existing `useTheme()` / `toggleTheme()` hook — no new infrastructure needed.

---

## Open Questions

> [!NOTE]
> The "More" bottom-sheet (shown in `MoreMenuButton.png`) — Reports, Analytics, Settings, Help & Support, About — appears to be accessible from the Dashboard page. This might not need an additional tab. We can add it as a long-press or as a separate floating "⋯" button. **For now the plan keeps the 7 tabs and this More sheet can be added later on approval.**

---

## Verification Plan

### Automated
- `npx tsc --noEmit` — TypeScript validation
- `npm run build` — Production build

### Manual
- Test on Chrome DevTools mobile viewport (390×844)
- Verify all 7 tabs navigate correctly
- Verify dark mode toggle works from mobile top bar
- Verify desktop layout is completely unaffected
