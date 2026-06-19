# ZeptoMail Email Integration — Setup Guide

Everything in the codebase is ready. When your ZeptoMail account is approved, follow these steps to go live — **no code changes needed**.

---

## What Was Built

```
supabase/functions/
├── _shared/
│   └── zeptomail.ts           ← Shared API client + branded HTML template builder
├── send-notification-email/
│   └── index.ts               ← Transactional alert emails (now ZeptoMail-powered)
└── send-daily-digest/
    └── index.ts               ← Daily KPI digest (now ZeptoMail-powered)
```

Both functions **gracefully no-op** while the secrets are absent — no crashes, no broken deploys.

---

## What I Need From You

To activate email delivery, you need to provide **3 values**. Get them from your ZeptoMail account after approval:

| Secret Name | Where to find it | Example |
|---|---|---|
| `ZEPTOMAIL_API_TOKEN` | ZeptoMail → Mail Agents → Your Agent → **Send Mail Token** | `PHtE6r1...` |
| `ZEPTOMAIL_FROM_EMAIL` | A verified sender address on your domain | `noreply@okfarm.ng` |
| `ZEPTOMAIL_FROM_NAME` | Display name for the sender | `OKFARM Distributor` |

> [!IMPORTANT]
> The `ZEPTOMAIL_FROM_EMAIL` domain **must be verified** in ZeptoMail (DNS SPF/DKIM records). ZeptoMail walks you through this when you add a domain.

---

## Step-by-Step Activation (When Account is Approved)

### Step 1 — Verify your sending domain in ZeptoMail
1. Log in at [mail.zoho.com/zm](https://mail.zoho.com/zm)
2. Go to **Settings → Domains → Add Domain**
3. Enter your domain (e.g. `okfarm.ng`)
4. Add the TXT, SPF and DKIM records to your DNS provider as instructed
5. Click Verify

### Step 2 — Create a Mail Agent & get the API token
1. In ZeptoMail → **Mail Agents → New Mail Agent** → name it `distribo-transactional`
2. Under the agent → **Send Mail Token → Generate Token**
3. Copy the token — you'll only see it once

### Step 3 — Add secrets to Supabase
Go to your Supabase project → **Settings → Edge Functions → Secrets** and add:

```
ZEPTOMAIL_API_TOKEN    = <token from step 2>
ZEPTOMAIL_FROM_EMAIL   = noreply@yourdomain.com
ZEPTOMAIL_FROM_NAME    = OKFARM Distributor
```

### Step 4 — Deploy the updated edge functions
```powershell
# From the project root
npx supabase functions deploy send-notification-email --no-verify-jwt
npx supabase functions deploy send-daily-digest --no-verify-jwt
```

Or push via your Supabase GitHub integration if connected.

### Step 5 — Test it
Call the function from the Supabase Dashboard → Edge Functions → `send-notification-email` → **Invoke**:

```json
{
  "to": "your@email.com",
  "subject": "Test from Distribo",
  "title": "ZeptoMail is working!",
  "body": "This is a test notification from the OKFARM Distributor platform.",
  "action_url": "https://yourdomain.vercel.app"
}
```

A branded email with the Distribo header should arrive within seconds.

---

## Email Triggers Already Wired

| Trigger | Function | When it fires |
|---|---|---|
| **Daily Digest** | `send-daily-digest` | Every morning (via pg_cron) — sends to users with daily digest ON |
| **Transactional alert** | `send-notification-email` | Called from `check-overdue-payments` and any future alert hooks |

### Adding More Triggers Later
Call `send-notification-email` from any edge function:
```ts
await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
  },
  body: JSON.stringify({
    to: 'vendor@example.com',
    subject: 'Low stock alert',
    title: 'Stock Running Low',
    body: 'Your product <b>FanYogo 500ml</b> is below the minimum threshold.',
    action_url: 'https://yourdomain.vercel.app/inventory',
  }),
});
```

---

## ZeptoMail Free Tier Notes

- **10,000 emails/month free** during trial
- After approval, production quota depends on your plan
- Transactional emails only (not marketing bulk sends)
