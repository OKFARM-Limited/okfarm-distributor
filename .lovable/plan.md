

# OKFARM Distributor Manager — Implementation Plan

## Overview
A comprehensive, offline-first PWA for managing FanMilk Nigeria distributors. Mock data throughout, responsive for mobile (Android primary), role-based access (admin/assistant), dark mode, and clean FanMilk branding (blues/greens).

---

## 1. Foundation & Layout
- **Theme**: FanMilk-branded colors (blue/green palette), dark mode toggle via `next-themes`
- **Sidebar navigation** with all module links, collapsible on mobile (hamburger menu)
- **Top bar** with search, notifications bell (toast-based), dark mode toggle, user avatar
- **Offline indicator** banner showing sync status (mock)
- **PWA setup** with `vite-plugin-pwa`, installable from browser

## 2. Auth & Security
- **Login page**: Email/password fields with hardcoded mock credentials (admin@okfarm.com / assistant@okfarm.com)
- **PIN entry screen** after login with mock PIN verification
- **Biometrics toggle** (visual only, mock)
- **Role-based routing**: Admin sees all modules; assistants see limited views (no commission/incentive management)
- **Audit trail page**: Log of mock user actions (timestamps, actions taken)

## 3. Vendor & Asset Management
- **Vendor dashboard**: Card/table list of 30 mock vendors (name, photo, phone, territory, biometrics status)
- **Search, filter** (by territory, status), **sort** (by name, sales)
- **Add/Edit vendor form**: Name, photo upload (mock preview), phone, ID, biometrics toggle, territory dropdown
- **Asset management**: List of 15 mock assets (push carts, bikes with IDs and status). Assign/unassign assets to vendors via dropdown
- **Mobile**: Card-based list, swipe actions for edit

## 4. Daily Stock Allocation & Reconciliation
- **Morning allocation**: Select vendor → SKU matrix grid (10 products) with quantity inputs, auto-calculated total value. Confirm saves to local state
- **Evening reconciliation**: Per vendor, input returns per SKU → auto-calculate sold qty, value, dues, spoilage. Alert banners for expiry flags
- **History log**: Filterable table of past allocations/reconciliations by date and vendor
- **Mobile**: Stepper wizard for allocation flow, collapsible accordion sections

## 5. Sales & Payment Tracking
- **Daily sales entry**: Per-vendor form with SKU quantities, total value, cash/mobile money payment toggle
- **Dues & payment collection**: Generate dues statements with PDF-style preview (mock), mark as paid button
- **Sales overview dashboard**: Bar chart (daily sales), pie chart (payment methods), weekly trends using Recharts
- **Mobile**: Simple form inputs, pull-to-refresh simulation

## 6. Performance Dashboards
- **Main KPI dashboard**: Cards for total vendors, attendance rate, avg daily sales, top 5 performers
- **Vendor detail pages**: Line charts for days worked, sales over time, productivity per asset
- **Depot-level insights**: Net stock position, top SKUs bar chart, low-activity alert banners
- **Export buttons**: Mock CSV download for reports
- **Mobile**: Scrollable horizontal cards, responsive charts

## 7. Incentives & Commissions
- **Commission calculator**: Auto-compute monthly commissions from mock sales data (volume, consistency, days worked). Breakdown table
- **Payout tracking**: List of past payouts, mark as disbursed (mock mobile money status)
- **Incentive overview**: Bonus rewards list with eligibility criteria
- **Mobile**: Summary cards with expandable detail modals

## 8. Additional Features
- **GPS mock maps**: Leaflet.js integration showing mock vendor route pins on a map (placeholder coordinates around Lagos)
- **Order placement**: Form to place orders to FanMilk depot (mock submission with toast confirmation)
- **Notifications**: In-app toast banners for low stock, expiry alerts, pending tasks (mock scheduled)
- **Offline-first**: LocalStorage for draft entries, visual sync status indicator

## 9. Mock Data
- 30 vendors with realistic Nigerian names, phone numbers, territories
- 15 assets (push carts, bikes) with statuses
- 10 SKU products (ice cream varieties with prices)
- 30 days of historical sales/allocation data
- Commission and payout history

## Pages & Routes
- `/login` → Login + PIN
- `/` → Home dashboard (KPIs)
- `/vendors` → Vendor list
- `/vendors/:id` → Vendor detail
- `/assets` → Asset management
- `/allocation` → Daily stock allocation
- `/reconciliation` → Evening reconciliation
- `/allocation/history` → Allocation history
- `/sales` → Daily sales entry
- `/payments` → Payment tracking
- `/performance` → Performance dashboards
- `/performance/:vendorId` → Vendor performance detail
- `/commissions` → Commission calculator
- `/payouts` → Payout tracking
- `/orders` → Order placement
- `/map` → GPS vendor map
- `/audit` → Audit trail
- `/settings` → App settings (dark mode, profile)

