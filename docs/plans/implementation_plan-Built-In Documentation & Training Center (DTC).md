# Implementation Plan — Built-In Documentation & Training Center (DTC)

This plan details the steps to build a context-aware in-app knowledge base for Distribo, enabling each user role to access playbooks, module guides, and troubleshooting steps directly inside a sliding sheet overlay.

---

## User Review Required

> [!IMPORTANT]
> **1. Custom Lightweight Markdown Parser vs. External Dependency**
> I propose writing a lightweight custom React Markdown renderer (`<MarkdownViewer />`) using simple regex rules. This avoids importing third-party npm libraries, keeping the build size smaller and avoiding any security vulnerabilities with unverified packages. It will support:
> - `#`, `##`, `###` headers
> - `**bold**`, `*italics*`
> - `-` bulleted lists
> - `[Link Text](url)` and `![Alt Text](image_url)`
> - Simple `| Table | Headers |` structures
> 
> Let me know if you would prefer importing `react-markdown` instead.

> [!NOTE]
> **2. Context-Aware URL Matching**
> Articles in the database will have a `path_trigger` column (e.g. `/inventory`, `/stock-recalc`). When a user opens the Help Drawer, it reads the current browser URL path and automatically displays articles matching that route at the top of the list under "Helpful on this Page".

---

## Open Questions

> [!WARNING]
> - **Initial Content Seeding:** Are there any additional specific guides or FAQs you would like pre-seeded in the database besides: *Getting Started*, *Vendor Playbook*, *Stock Recalc Guide*, *Inbound Stock Guide*, and *Reconciliation Guide*? (I will populate these 5 with detailed instructions matching the operational flows).

---

## Proposed Changes

### Database Layer

#### [NEW] [20260620000200_create_help_system.sql](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/migrations/20260620000200_create_help_system.sql)
- Create `public.help_categories` table.
- Create `public.help_articles` table (containing `title`, `slug`, `body_markdown`, `path_trigger`, `video_url`).
- Create `public.help_article_roles` join table for role-based filtering (linking articles to `app_role` enums).
- Enable RLS policies:
  - `SELECT` permitted for all `authenticated` users.
  - `INSERT/UPDATE/DELETE` restricted to users with the `admin` role.
- Seed initial playbooks and guides.

---

### Component Layer

#### [NEW] [HelpDrawer.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/components/HelpDrawer.tsx)
- Create a sliding sheet component using shadcn's `<Sheet />` (`src/components/ui/sheet.tsx`).
- Fetch categories and articles using a Supabase query, filtering by:
  - User role (matching `user.role` from `useAuth()`).
  - Active pathname (from `react-router-dom`'s `useLocation()`).
- Include:
  - Search input field to filter articles by title/body.
  - Breadcrumb-style navigation (Category List -> Article List -> Article Reader).
  - Custom `<MarkdownViewer />` component to safely render markdown guides.

#### [MODIFY] [TopBar.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/components/layout/TopBar.tsx)
- Import `HelpCircle` from `lucide-react` and `<HelpDrawer />` component.
- Add help buttons next to the notifications bell in both desktop and mobile header sections.
- Wire the button click to open the `HelpDrawer`.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no TypeScript compiler errors.

### Manual Verification
- Log in as Super Admin (`leonkouchica@gmail.com`) and open `/stock-recalc`. Click the Help icon and confirm that the "Stock Recalc Guide" is listed at the top under "Helpful on this Page".
- Test the search bar inside the drawer: type "Vendor" or "Recalc" and verify matching articles are returned.
- Verify that only role-appropriate articles show up (e.g. if a vendor or viewer logs in, they should not see the admin-only database recalculation manual).
