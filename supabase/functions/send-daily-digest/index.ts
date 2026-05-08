// Daily digest: gather yesterday's KPIs and send a summary email to managers/admins
// who opted into daily_digest in notification_preferences. Designed to be invoked by pg_cron.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // yesterday in UTC
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yest = d.toISOString().split('T')[0];

    // KPIs
    const [salesRes, allocRes, recRes, lowStockRes] = await Promise.all([
      supabase.from('sales').select('total_value,amount_paid,outstanding,vendor_id').eq('date', yest),
      supabase.from('allocations').select('id').eq('date', yest),
      supabase.from('reconciliations').select('total_sold,total_spoilage,total_returned,cash_collected').eq('date', yest),
      supabase.from('stock_levels').select('current_stock,min_stock,product_id').lt('current_stock', 50),
    ]);

    const sales = salesRes.data || [];
    const totalSales = sales.reduce((s, x) => s + Number(x.total_value || 0), 0);
    const totalPaid = sales.reduce((s, x) => s + Number(x.amount_paid || 0), 0);
    const totalOutstanding = sales.reduce((s, x) => s + Number(x.outstanding || 0), 0);
    const activeVendors = new Set(sales.map(s => s.vendor_id)).size;
    const allocations = (allocRes.data || []).length;
    const recs = recRes.data || [];
    const cashCollected = recs.reduce((s, r) => s + Number(r.cash_collected || 0), 0);
    const spoilage = recs.reduce((s, r) => s + Number(r.total_spoilage || 0), 0);
    const lowStock = (lowStockRes.data || []).length;

    // Recipients: users with daily_digest=true and an email
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id,email_address,channel_email,daily_digest')
      .eq('daily_digest', true)
      .eq('channel_email', true);

    const recipients = (prefs || []).filter(p => !!p.email_address);

    const subject = `OKFARM Daily Digest — ${yest}`;
    const summary = `
      <ul style="line-height:1.8;">
        <li><b>Total sales:</b> ₦${totalSales.toLocaleString()}</li>
        <li><b>Cash collected:</b> ₦${(totalPaid + cashCollected).toLocaleString()}</li>
        <li><b>Outstanding:</b> ₦${totalOutstanding.toLocaleString()}</li>
        <li><b>Active vendors:</b> ${activeVendors}</li>
        <li><b>Allocations:</b> ${allocations}</li>
        <li><b>Spoilage units:</b> ${spoilage}</li>
        <li><b>Low-stock products:</b> ${lowStock}</li>
      </ul>`;

    const body = `Here's your operations summary for <b>${yest}</b>:${summary}`;

    let sent = 0, failed = 0;
    for (const r of recipients) {
      try {
        const resp = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            to: r.email_address,
            subject,
            title: 'Daily Operations Digest',
            body,
          }),
        });
        if (resp.ok) sent++; else failed++;
      } catch {
        failed++;
      }
    }

    // Also create an in-app notification for admins (no user_id = broadcast to admins)
    await supabase.from('notifications').insert({
      title: 'Daily Digest Ready',
      message: `${yest}: ₦${totalSales.toLocaleString()} in sales, ${activeVendors} active vendors, ${lowStock} low-stock items.`,
      type: 'info',
      priority: 'medium',
      action_url: '/',
    });

    return new Response(JSON.stringify({ ok: true, recipients: recipients.length, sent, failed, date: yest }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[send-daily-digest]', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
