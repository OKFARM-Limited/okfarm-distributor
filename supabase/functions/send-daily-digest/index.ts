/**
 * send-daily-digest — Supabase Edge Function
 *
 * Collects yesterday's KPIs from the database and sends a rich daily digest email
 * to every user who opted-in via Settings → Notification Preferences.
 *
 * Designed to be triggered by Supabase pg_cron (e.g. every day at 06:00 WAT / 05:00 UTC).
 * Can also be invoked manually via the Supabase dashboard or an API call.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { ZeptoMail, buildEmailHtml } from '../_shared/zeptomail.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // ── Yesterday (UTC) ───────────────────────────────────────────────────────
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yest = d.toISOString().split('T')[0];

    // ── Gather KPIs in parallel ───────────────────────────────────────────────
    const [salesRes, allocRes, recRes, lowStockRes] = await Promise.all([
      supabase
        .from('sales')
        .select('total_value,amount_paid,outstanding,vendor_id')
        .eq('date', yest),
      supabase.from('allocations').select('id').eq('date', yest),
      supabase
        .from('reconciliations')
        .select('total_sold,total_spoilage,total_returned,cash_collected')
        .eq('date', yest),
      supabase.from('stock_levels').select('current_stock,min_stock,product_id').lt('current_stock', 50),
    ]);

    const sales = salesRes.data ?? [];
    const totalSales     = sales.reduce((s, x) => s + Number(x.total_value   ?? 0), 0);
    const totalPaid      = sales.reduce((s, x) => s + Number(x.amount_paid   ?? 0), 0);
    const totalOutstanding = sales.reduce((s, x) => s + Number(x.outstanding ?? 0), 0);
    const activeVendors  = new Set(sales.map(s => s.vendor_id)).size;
    const allocations    = (allocRes.data ?? []).length;
    const recs           = recRes.data ?? [];
    const cashCollected  = recs.reduce((s, r) => s + Number(r.cash_collected ?? 0), 0);
    const spoilage       = recs.reduce((s, r) => s + Number(r.total_spoilage ?? 0), 0);
    const lowStock       = (lowStockRes.data ?? []).length;

    // ── Recipients ────────────────────────────────────────────────────────────
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id,email_address,daily_digest')
      .eq('daily_digest', true);

    const recipients = (prefs ?? []).filter(p => !!p.email_address);

    // ── Build email content ───────────────────────────────────────────────────
    const fmt = (n: number) => `NGN ${n.toLocaleString('en-NG')}`;

    const subject = `OKFARM Daily Digest — ${yest}`;

    const bodyHtml = `
      <p>Here's your operations summary for <strong>${yest}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
        <tbody>
          ${[
            ['Total Sales',       fmt(totalSales)],
            ['Cash Collected',    fmt(totalPaid + cashCollected)],
            ['Outstanding',       fmt(totalOutstanding)],
            ['Active Vendors',    String(activeVendors)],
            ['Allocations',       String(allocations)],
            ['Spoilage Units',    String(spoilage)],
            ['Low-Stock Products',String(lowStock)],
          ].map(([label, value], i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'};">
              <td style="padding:8px 10px;color:#64748b;border-bottom:1px solid #e2e8f0;">${label}</td>
              <td style="padding:8px 10px;font-weight:600;color:#0f172a;text-align:right;border-bottom:1px solid #e2e8f0;">${value}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${lowStock > 0
        ? `<p style="margin-top:16px;padding:10px 14px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:13px;color:#92400e;">
             ⚠️ <strong>${lowStock}</strong> product(s) are running low on stock. Visit the Inventory page to reorder.
           </p>`
        : ''}`;

    const html = buildEmailHtml({
      title: 'Daily Operations Digest',
      body: bodyHtml,
      actionUrl: Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'vercel.app') ?? '#',
      actionLabel: 'Open Distribo',
      footerNote: `This digest covers activity for ${yest}. Manage digest settings in <b>Settings → Notification Preferences</b>.`,
    });

    // ── Send via ZeptoMail ────────────────────────────────────────────────────
    let sent = 0, failed = 0, skipped = 0;

    if (!ZeptoMail.isConfigured()) {
      console.warn('[send-daily-digest] ZeptoMail not configured — skipping email delivery.');
      skipped = recipients.length;
    } else {
      const zm = new ZeptoMail();
      for (const r of recipients) {
        const result = await zm.send({ to: r.email_address!, subject, html });
        if (result.ok) {
          sent++;
          console.log(`[send-daily-digest] Sent to ${r.email_address}`);
        } else {
          failed++;
          console.error(`[send-daily-digest] Failed for ${r.email_address}: ${result.error}`);
        }
      }
    }

    // ── Create in-app notification ────────────────────────────────────────────
    await supabase.from('notifications').insert({
      title: 'Daily Digest Ready',
      message: `${yest}: ${fmt(totalSales)} in sales, ${activeVendors} active vendors, ${lowStock} low-stock items.`,
      type: 'info',
      priority: 'medium',
      action_url: '/',
    });

    return new Response(
      JSON.stringify({ ok: true, date: yest, recipients: recipients.length, sent, failed, skipped }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (e: any) {
    console.error('[send-daily-digest]', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
