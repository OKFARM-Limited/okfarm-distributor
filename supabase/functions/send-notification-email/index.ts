/**
 * send-notification-email — Supabase Edge Function
 *
 * Sends a single transactional notification email via ZeptoMail.
 * Falls back gracefully when ZeptoMail is not yet configured (returns ok:false with reason).
 *
 * Payload:
 *   { to, subject, title, body, action_url?, action_label? }
 */
import { ZeptoMail, buildEmailHtml } from '../_shared/zeptomail.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  to: string;
  toName?: string;
  subject: string;
  title: string;
  body?: string;
  message?: string;
  action_url?: string;
  action_label?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const json = await req.json() as Payload;
    const { to, toName, subject, title, action_url, action_label } = json;
    const body = json.body ?? json.message;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body or message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Guard: ZeptoMail not yet configured ───────────────────────────────────
    if (!ZeptoMail.isConfigured()) {
      console.warn(
        '[send-notification-email] ZeptoMail not configured. ' +
        'Add ZEPTOMAIL_API_TOKEN and ZEPTOMAIL_FROM_EMAIL to Supabase Edge Function secrets.'
      );
      return new Response(
        JSON.stringify({ ok: false, queued: false, reason: 'zeptomail_not_configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Build and send ────────────────────────────────────────────────────────
    const html = buildEmailHtml({ title, body, actionUrl: action_url, actionLabel: action_label });
    const zm = new ZeptoMail();
    const result = await zm.send({ to, toName, subject, html });

    if (!result.ok) {
      console.error('[send-notification-email] Send failed:', result.error);
      return new Response(
        JSON.stringify({ ok: false, error: result.error }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[send-notification-email] Sent to ${to} — messageId: ${result.messageId}`);
    return new Response(
      JSON.stringify({ ok: true, messageId: result.messageId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (e: any) {
    console.error('[send-notification-email] Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
