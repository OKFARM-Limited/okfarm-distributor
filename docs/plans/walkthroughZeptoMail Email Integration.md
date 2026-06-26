# Walkthrough — ZeptoMail Email Integration

## Summary

ZeptoMail transactional email is **live** on Distribo with **category-specific email templates** for each notification type.

---

## Phase 1: Activation (Configuration Only)

All email infrastructure code was pre-built. Activation required only configuration:

### Supabase Edge Function Secrets
- `ZEPTOMAIL_API_TOKEN` — ZeptoMail Send Mail Token
- `ZEPTOMAIL_FROM_EMAIL` — `noreply@distribo.com.ng`
- `ZEPTOMAIL_FROM_NAME` — `Distribo`

### Database `app_settings`
- `edge_functions_url` → `https://vvwnszvdbmdfhpatjnvz.supabase.co/functions/v1`
- `edge_functions_anon_key` → project anon key

### Edge Functions Deployed
- `send-notification-email`, `send-daily-digest`, `admin-create-user`

### Daily Digest Cron
- Scheduled via `pg_cron` at `0 5 * * *` (06:00 WAT daily)
- Recipient updated to `okfarmlimited@yahoo.com`

---

## Phase 2: Type-Specific Email Templates

### Files Changed

#### [MODIFY] [zeptomail.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/_shared/zeptomail.ts)
Added `buildTypedEmailHtml()` with 4 category themes, each with distinct colors, badges, icons, and CTAs. Original `buildEmailHtml()` preserved for backward compatibility.

#### [MODIFY] [send-notification-email/index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/send-notification-email/index.ts)
Accepts optional `type` field in payload, uses `buildTypedEmailHtml()` for category-aware rendering.

#### [NEW] [20260626000000_pass_notification_type_to_email.sql](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/migrations/20260626000000_pass_notification_type_to_email.sql)
Updated `dispatch_notification_emails()` trigger to include `'type', NEW.type` in the HTTP POST body.

### Template Designs

| Category | Types | Header | Badge | CTA |
|---|---|---|---|---|
| 🔴 Stock | `stock`, `low_stock`, `expiry` | Red/orange gradient | `📦 STOCK ALERT` | View Inventory |
| 🟣 Payment | `payment` | Purple/indigo gradient | `💳 PAYMENT ALERT` | View Payments |
| 🟢 Sales | `sales`, `sale` | Green/teal gradient | `📊 SALES UPDATE` | View Sales |
| 🔵 System | `info`, `maintenance`, etc. | Blue gradient | `ℹ️ SYSTEM NOTICE` | Open Distribo |

---

## Active Email Flows

| Flow | Trigger | Template |
|---|---|---|
| **Real-time alerts** | `INSERT` into `notifications` → DB trigger → edge function | Category-specific |
| **Welcome email** | Admin creates user via Role Management | Generic (branded) |
| **Daily digest** | `pg_cron` at 06:00 WAT | Custom KPI table |

## Validation

✅ All 4 template types tested and confirmed received with correct designs.
