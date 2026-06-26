# Type-Specific Email Templates for Notifications

## Goal

Replace the generic one-size-fits-all email template with **category-specific** designs that visually distinguish stock alerts from payment reminders from sales updates, each with appropriate colors, icons, and CTAs.

## Notification Types in the System

| Type | Category | Trigger Source | Current Frequency |
|---|---|---|---|
| `stock`, `low_stock` | 🔴 Stock | `trg_notify_low_stock`, `recalculate_stock_levels()` | On stock drop below min |
| `payment` | 🟣 Payment | `notify_overdue_deliveries()` | On overdue invoices |
| `sales` | 🟢 Sales | Manual / future triggers | — |
| `info`, `maintenance`, `expiry`, `pending_return`, `attendance`, `vendor`, `sale` | 🔵 System | Various | Various |

## Proposed Changes

### 1. Shared Template Builder

#### [MODIFY] [zeptomail.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/_shared/zeptomail.ts)

Add a new `buildTypedEmailHtml()` function alongside the existing generic one. Each category gets:

- **Header gradient color** matching the category
- **Emoji icon** in the title area
- **Category badge** (e.g. "STOCK ALERT", "PAYMENT REMINDER")
- **Contextual CTA label** (e.g. "View Inventory", "View Payments")
- **Category-specific accent color** for borders and buttons

| Category | Header Gradient | Badge | Default CTA | Icon |
|---|---|---|---|---|
| Stock | Red/Orange (`#dc2626` → `#ea580c`) | `STOCK ALERT` | View Inventory | 📦 |
| Payment | Purple/Indigo (`#7c3aed` → `#4f46e5`) | `PAYMENT ALERT` | View Payments | 💳 |
| Sales | Green/Teal (`#059669` → `#0d9488`) | `SALES UPDATE` | View Sales | 📊 |
| System | Blue (existing) (`#1e3a5f` → `#2563EB`) | `SYSTEM NOTICE` | Open Distribo | ℹ️ |

The existing `buildEmailHtml()` function remains unchanged for backward compatibility.

---

### 2. Edge Function Update

#### [MODIFY] [send-notification-email/index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/send-notification-email/index.ts)

- Accept a new optional `type` field in the payload
- Use `buildTypedEmailHtml()` when `type` is provided, falling back to the generic template

---

### 3. DB Trigger Update

#### [NEW] New migration to pass notification type to the edge function

Update `dispatch_notification_emails()` to include the notification `type` in the HTTP POST body sent to `send-notification-email`. This is a one-line addition to each `jsonb_build_object()` call:

```diff
 body := jsonb_build_object(
   'to', v_rec.email,
   'subject', NEW.title,
   'title', NEW.title,
   'message', NEW.message,
-  'action_url', v_action_url
+  'action_url', v_action_url,
+  'type', NEW.type
 )
```

## Verification Plan

After deployment, insert test notifications for each type and verify the emails have distinct designs:

```sql
-- Stock alert (red)
INSERT INTO notifications (title, message, type, priority) 
VALUES ('Low Stock Alert', 'FanYogo 115ml at Ikeja is at 12 units (min: 50)', 'stock', 'high');

-- Payment alert (purple)
INSERT INTO notifications (title, message, type, priority) 
VALUES ('Overdue Payment', 'Invoice INV-2026-0042 (NGN 485,000) was due on 2026-06-20', 'payment', 'high');

-- Sales update (green)
INSERT INTO notifications (title, message, type, priority) 
VALUES ('Daily Sales Target Hit', 'Ikeja depot reached 120% of daily target with NGN 890,000 in sales', 'sales', 'medium');

-- System notice (blue - existing style)
INSERT INTO notifications (title, message, type, priority) 
VALUES ('System Maintenance', 'Scheduled maintenance window: Sunday 2am-4am WAT', 'info', 'low');
```
