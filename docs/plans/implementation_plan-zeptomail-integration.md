# Activate ZeptoMail Email Integration for App Notifications

Now that the ZeptoMail account has been approved, we need to configure the secrets and verify the full pipeline works end-to-end. The good news is **the code infrastructure is already complete** — the edge functions, DB trigger, email templates, and preference system are all in place.

## Current State (Already Built)

The following components are already implemented and ready:

| Component | Status | Location |
|---|---|---|
| ZeptoMail client class + HTML template builder | ✅ Ready | [zeptomail.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/_shared/zeptomail.ts) |
| `send-notification-email` edge function | ✅ Ready | [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/send-notification-email/index.ts) |
| `send-daily-digest` edge function | ✅ Ready | [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/send-daily-digest/index.ts) |
| `admin-create-user` sends welcome email | ✅ Ready | [index.ts](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/functions/admin-create-user/index.ts) |
| DB trigger `dispatch_notification_emails` (pg_net) | ✅ Ready | [phase6_fixes.sql](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/migrations/20260614200000_phase6_fixes.sql) |
| `notification_preferences` table + UI | ✅ Ready | [NotificationPreferences.tsx](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/src/pages/settings/NotificationPreferences.tsx) |
| Supabase `config.toml` with JWT skip for email functions | ✅ Ready | [config.toml](file:///c:/Users/leonk/Documents/RUSSELL/OKFARM/okfarm distributor app/okfarm-distributor/supabase/config.toml) |

## What Needs To Be Done

Since all the code is already written, this is purely a **configuration + deployment** task. No code changes are needed.

### Step 1: Set Supabase Edge Function Secrets

Go to **Supabase Dashboard → Settings → Edge Functions → Secrets** and add these three secrets:

| Secret Name | Value | Where to Find It |
|---|---|---|
| `ZEPTOMAIL_API_TOKEN` | `Zoho-enczapikey wSsVR61...` (full token string **including** the prefix) | ZeptoMail → Agents → your Agent → SMTP/API → API tab → Send Mail Token |
| `ZEPTOMAIL_FROM_EMAIL` | Your verified sender address (e.g. `noreply@distribo.com.ng`) | ZeptoMail → Verified domains/addresses |
| `ZEPTOMAIL_FROM_NAME` | `Distribo` (or your preferred display name) | Choose any display name |

> [!IMPORTANT]
> The `ZEPTOMAIL_API_TOKEN` value must include the `Zoho-enczapikey ` prefix exactly as shown in the ZeptoMail dashboard. Copy the entire string — do NOT strip the prefix.

### Step 2: Set `app_settings` for DB Trigger

The `dispatch_notification_emails` database trigger uses `pg_net` to call the edge function when a notification row is inserted. It reads the Edge Function URL and anon key from the `app_settings` table.

Run this SQL in **Supabase SQL Editor** (replace with your actual project URL and anon key):

```sql
INSERT INTO public.app_settings (key, value) VALUES 
  ('edge_functions_url', '"https://kzxrifgekhpqbfvuwnmw.supabase.co/functions/v1"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.app_settings (key, value) VALUES 
  ('edge_functions_anon_key', '"your-anon-key-here"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

> [!NOTE]
> The `VITE_SUPABASE_PUBLISHABLE_KEY` in your `.env` is the anon key. Use that same value here.

### Step 3: Deploy Edge Functions

Deploy the updated edge functions to Supabase:

```bash
supabase functions deploy send-notification-email
supabase functions deploy send-daily-digest
supabase functions deploy admin-create-user
```

### Step 4: Verify Domain in ZeptoMail

Ensure your sender domain (e.g. `distribo.com.ng`) is verified in ZeptoMail:
1. ZeptoMail dashboard → **Domains** → Add domain
2. Add the required DNS records (SPF, DKIM, DMARC)
3. Wait for verification to complete

> [!WARNING]
> If the domain is not yet verified, you can use a ZeptoMail-provided test sender address for initial testing, but emails may land in spam.

### Step 5: Set Up Daily Digest Cron (Optional)

To schedule the daily digest email, set up a cron job in Supabase:

```sql
-- Run daily at 06:00 WAT (05:00 UTC)
SELECT cron.schedule(
  'send-daily-digest',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kzxrifgekhpqbfvuwnmw.supabase.co/functions/v1/send-daily-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key-here"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Verification Plan

### Manual Testing

1. **Test single email**: After setting secrets, invoke the edge function directly:
   ```bash
   curl -X POST "https://kzxrifgekhpqbfvuwnmw.supabase.co/functions/v1/send-notification-email" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "your-test-email@example.com",
       "subject": "Test from Distribo",
       "title": "Email Integration Active",
       "body": "If you can read this, ZeptoMail is working!"
     }'
   ```

2. **Test DB trigger flow**: Insert a test notification row in the SQL editor:
   ```sql
   INSERT INTO notifications (title, message, type, priority)
   VALUES ('Test Alert', 'This is a test notification email.', 'info', 'medium');
   ```
   Any admin/manager with email enabled in their `notification_preferences` should receive an email.

3. **Test welcome email**: Create a test user via the Admin → Role Management page and verify they receive the credentials email.

4. **Test daily digest**: Manually invoke the `send-daily-digest` function and check that opted-in users receive the digest.

## Open Questions

> [!IMPORTANT]
> **1. Do you have your ZeptoMail API token ready?** We need the Send Mail Token from ZeptoMail → Agents → SMTP/API tab to set as the `ZEPTOMAIL_API_TOKEN` secret.

> [!IMPORTANT]
> **2. What sender email address will you use?** This needs to be from a verified domain in ZeptoMail (e.g., `noreply@distribo.com.ng`). Is the domain already verified, or do we need to set up DNS records?

> [!IMPORTANT]
> **3. Do you have Supabase CLI access for deploying edge functions?** If not, we can deploy via the Supabase dashboard. Alternatively, if these functions are already deployed from a previous push, we just need to set the secrets.

> [!NOTE]
> **4. Daily Digest schedule**: The current code is set up to run at 06:00 WAT (05:00 UTC). Is this the preferred time, or would you like to adjust?
