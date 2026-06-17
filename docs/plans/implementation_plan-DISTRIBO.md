# Implementation Plan - Distribo UI Redesign

This plan outlines the steps required to redesign the User Interface of the project to match the mockups provided in the `docs/UI reference/` folder, including rebranding the application name to **Distribo** and implementing a modern, premium design system.

## User Review Required

> [!IMPORTANT]
> - **Rebranding to Distribo**: All user-visible mentions of `OKFARM` or `OKFARM Distributor Manager/App` will be rebranded to `Distribo`.
> - **Logo Asset**: The brand logo from [Distribo.png](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/docs/UI%20reference/Distribo.png) will be copied to the `public/` directory and used throughout the application.
> - **Route Additions**: We will add/verify support for the Password Recovery flow (`/password-recovery` or a sub-state of login) as shown in the mockups.
> - **No Changes to Logic**: Only CSS styling, Tailwind configurations, layout structures, and UI visual representation will be altered. Core business logic, APIs, and Supabase integrations will remain functional.

## Proposed Changes

---

### Brand Assets & Global Styles

#### [NEW] [logo](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/public/Distribo.png)
- Copy the brand logo from `docs/UI reference/Distribo.png` to the public folder so it can be served as a static asset.

#### [MODIFY] [index.html](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/index.html)
- Rebrand the HTML `<title>` tag from `OKFARM Distributor Manager` to `Distribo - Distributor Operations & Growth Platform`.
- Update SEO meta tags, social sharing title, description, and apple web app titles to refer to `Distribo`.
- Import modern typography (e.g. Google Fonts Inter/Outfit) if needed for premium font aesthetics.

#### [MODIFY] [manifest.json](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/public/manifest.json)
- Rebrand manifest name to `Distribo Distributor Manager` and short name to `Distribo`.
- Update description and theme/background colors if applicable to match the new color system.

#### [MODIFY] [generatePDF.ts](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/lib/generatePDF.ts)
- Update the hardcoded report header from `OKFARM Distributor Manager` to `Distribo Distributor Manager` to maintain consistent branding in all exported PDF reports.

#### [MODIFY] [DuesStatement.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/dues/DuesStatement.tsx)
- Rebrand the printed view header from `OKFARM — Dues Statement` to `Distribo — Dues Statement` and update the statement footer to refer to `Distribo` instead of `OKFARM`.

#### [MODIFY] [index.css](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/index.css)
- Update CSS custom properties for color tokens to match the dark navy, bright blue, and neutral tones shown in the mockups:
  - `--sidebar-background`: Deep Navy Blue (approx. `hsl(215, 60%, 12%)`)
  - `--sidebar-foreground`: Cool Grey (approx. `hsl(210, 15%, 85%)`)
  - `--sidebar-accent`: Dark Blue-Navy (approx. `hsl(215, 45%, 18%)`)
  - `--primary`: Vibrant Royal Blue (approx. `hsl(221, 100%, 50%)`)
  - `--background`: Clean light-grey canvas (approx. `hsl(210, 30%, 98%)`)
  - `--card`: Pure White (`hsl(0, 0%, 100%)`)
- Ensure premium typography (Inter/Outfit) is loaded via Google Fonts or Tailwind setup.

---

### Layout & Navigation

#### [MODIFY] [AppSidebar.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/AppSidebar.tsx)
- Rebrand header text and display the Distribo logo image.
- **Maintain the existing grouped sidebar menu structure and all original items** (preserving Overview, Operations, Inventory, Finance, Analytics, Programs, Admin, and System groups and their respective routes).
- Apply the new premium color palette to the sidebar container (deep navy blue background).
- Style active menu items with the full-bleed solid royal blue background as seen in the mockups.
- Restyle the footer element to display the "Admin User" avatar `AA`, name, "Super Admin" role, and chevron down toggle.

#### [MODIFY] [TopBar.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/components/layout/TopBar.tsx)
- Align elements horizontally: Left sidebar trigger, Date selector widget, Outlet selector dropdown, right-side elements (notifications bell with badge, and user initials badge `AA`).
- Adjust spacing and borders to match the clean mockup headers.

#### [MODIFY] [App.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/App.tsx)
- Introduce the `/password-recovery` path to display the newly designed Password Recovery page.

---

### Auth & Recovery Pages

#### [MODIFY] [Login.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Login.tsx)
- Redesign the layout into a split view:
  - **Left Section**: Navy blue background banner showcasing the brand logo, a header message ("Manage your distribution business with ease"), subtitle, and 4 feature highlight cards (Vendor Management, Sales & Inventory, Payments & Commissions, Insights & Reports). Add decorative truck/cart graphic.
  - **Right Section**: White card container with inputs for Email and Password, Remember Me, Forgot Password link, Blue Sign-in button with inline icon, SSO button, and administrator help text.
  - Add footer elements containing rights and security tags.

#### [NEW] [PasswordRecovery.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/PasswordRecovery.tsx)
- Create a corresponding recovery view matching `distribo-dash-password-recovery.png`:
  - Same split layout layout as Login.
  - Form includes email reset link triggers, "Try another way" buttons, back to login links, and lock illustration.

---

### Main Dashboard & Content Pages

#### [MODIFY] [Dashboard.tsx](file:///C:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm%20distributor%20app/okfarm-distributor/src/pages/Dashboard.tsx)
- Update layout elements:
  - Add "Download Report" button below header.
  - Render 5 KPI cards with custom icons and growth rate percentage subtext.
  - Re-style Recharts charts:
    - **Sales Overview**: Line chart with smooth curved paths, shaded area gradients, customized Tooltip, and Weekly dropdown.
    - **Sales by Outlet**: Pie/Donut chart styled exactly with percentage slices, center total text label, and legend list detailing outlet-wise sales amounts.
  - Re-style Recent Transactions table using clean borders and badges matching the Completed/Pending/Approved colors.
  - Re-style Low Stock Alerts list with red badge alerts and placeholder product illustrations.

#### [MODIFY] Other Sub-Pages
We will update individual pages to match the screenshots:
- **Vendors**: List view with filters, detailed status cards, and the side panel details drawer (as in `distribo-dash-vendors.png`).
- **Sales**: Sales overview trend chart, sales by category donut chart, sales by outlet table, and top products (as in `distribo-dash-sales.png`).
- **Allocations**: Multi-tab filter layout, progress bar stats, status breakdown donut, and recent activity logs (as in `distribo-dash-allocation.png`).
- **Inventory**: Inbound stock lists, alerts tracker, low stock badges, category charts, and action panels (as in `distribo-dash-inventory.png`).
- **Payments / Commissions / Payouts / Settlements**: Align columns, stats cards, filtering criteria, and transaction details with their respective screen designs.
- **Products / Outlets**: Table grid view, details, active state filters, map overlays (where applicable), and action buttons.
- **Reports / Analytics**: Custom charts, filter sets, heatmap, category charts, and summary reports.
- **Notifications / Settings / Profile**: Styled layouts, toggle switches, preferences panels, security setups, and account summaries.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify that TS files compile correctly without syntax errors.
- Run `npm run test` or standard vitest commands if applicable.

### Manual Verification
- Launch local development server using `npm run dev`.
- Inspect each view in the browser (Desktop/Mobile responsive modes) and compare with the mockups.
- Verify path transitions (e.g., toggling between Login, Password Recovery, and Dashboard).
