# Implementation Plan - Mobile UI/UX Enhancements

Upgrade the mobile experience of the Distribo platform so it feels, looks, and behaves like a premium, native mobile application when installed on Android or iOS.

## User Review Required

> [!IMPORTANT]
> The bottom navigation bar will render exclusively on mobile viewports (`< 768px` width) and remain hidden on desktop. It will contain **5 tabs** that represent the most common operations:
> 1. **Dashboard** (Home)
> 2. **Vendors** (Overview & Onboarding)
> 3. **Check-In** (Daily operations)
> 4. **Scanner** (Inventory barcode scan)
> 5. **Settings** (App preferences)

> [!NOTE]
> The desktop left-hand sidebar will remain fully functional on larger screens. On mobile, we will keep the hamburger trigger active but rely primarily on the bottom tab bar and Floating Action Buttons (FAB) for standard workflows.

## Proposed Changes

We will create new layout elements and update core action pages to optimize touch targets, navigation, and spacing.

---

### Layout & Navigation Components

#### [NEW] [BottomBar.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/BottomBar.tsx)
* Create a fixed, bottom navigation bar aligned to the bottom of the screen (`fixed bottom-0 left-0 right-0`).
* Render 5 icon buttons (Dashboard, Vendors, Check-In, Scanner, Settings) with active state highlighting matching the Distribo color palette (`#2563EB`).
* Include badge notification indicators (e.g. showing active alert count on the Settings/Notification tab).

#### [MODIFY] [AppLayout.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/AppLayout.tsx)
* Import the new `BottomBar` component.
* Add responsive bottom padding (`pb-16 md:pb-6`) to the main content wrapper so content doesn't get obscured behind the fixed bottom bar.
* Conditionally render `BottomBar` only on mobile viewports (`block md:hidden`).

#### [MODIFY] [TopBar.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/TopBar.tsx)
* Optimize the header layout for mobile screens:
  * Remove redundant selectors or elements on extremely small screens to maximize space.
  * Stick the header to the top of the viewport (`sticky top-0 z-30`).

---

### Core Page Redesigns (Mobile-First UX)

#### [MODIFY] [VendorList.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/vendors/VendorList.tsx)
* Hide the standard top-row button (`+ Add Vendor`) on mobile viewports.
* Implement a **Floating Action Button (FAB)** in the bottom-right corner (`fixed bottom-20 right-4 z-40`) rendering a circular blue button (`+` icon) that links directly to the onboarding page.
* Adjust list spacing so touch targets are large and comfortable (min 48px height).

#### [MODIFY] [SalesEntry.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/sales/SalesEntry.tsx)
* Add a Floating Action Button (FAB) on the Sales listing page to quickly initiate a new sales entry.
* Stack form elements into a clean single-column structure on mobile viewports.

---

### Global Design Cleanups (CSS & UI)

#### [MODIFY] [index.css](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/index.css)
* Add subtle native-like active tap indicators (`-webkit-tap-highlight-color: transparent` to prevent ugly blue browser box highlights when buttons are clicked).
* Smooth out transitions for drawer slides and sheets.

---

## Verification Plan

### Automated Tests
* Run `npx tsc --noEmit` to verify type safety.
* Run `npm run build` to confirm production bundle builds successfully.

### Manual Verification
* Deploy to staging (Vercel) and test using the browser subagent in mobile responsive viewports.
* Capture visual screenshots to confirm bottom tab bar and mobile drawer behaviors render correctly.
