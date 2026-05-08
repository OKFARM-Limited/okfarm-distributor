// Sends a single notification email via Lovable's transactional email infrastructure.
// Falls back to a logged warning if email infra is not yet configured.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  to: string;
  subject: string;
  title: string;
  body: string;
  action_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { to, subject, title, body, action_url } = (await req.json()) as Payload;
    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const html = `
      <!doctype html><html><body style="font-family: -apple-system, Segoe UI, sans-serif; background:#f5f7fa; margin:0; padding:24px;">
        <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:8px; padding:32px; box-shadow:0 1px 3px rgba(0,0,0,.06);">
          <div style="font-size:14px; color:#0066cc; font-weight:600; margin-bottom:8px;">OKFARM Distributor Manager</div>
          <h1 style="font-size:20px; margin:0 0 16px; color:#111;">${title}</h1>
          <p style="font-size:15px; line-height:1.5; color:#333;">${body}</p>
          ${action_url ? `<p style="margin-top:24px;"><a href="${action_url}" style="background:#0066cc; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:600;">Open</a></p>` : ''}
          <hr style="border:none; border-top:1px solid #eee; margin:32px 0 16px;" />
          <p style="font-size:12px; color:#888;">You're receiving this because you enabled email notifications. Manage preferences in the app under Settings → Notification Preferences.</p>
        </div>
      </body></html>`;

    // Try to enqueue via the email infra (created by setup_email_infra)
    const { error: enqErr } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      message: {
        to: [to], subject, html,
        purpose: 'transactional',
        idempotency_key: crypto.randomUUID(),
      },
    } as any);

    if (enqErr) {
      console.warn('[send-notification-email] Email infra not ready:', enqErr.message);
      return new Response(JSON.stringify({ ok: false, queued: false, reason: 'email_infra_not_configured' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, queued: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[send-notification-email]', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
