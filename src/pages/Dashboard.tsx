import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOutletContext } from '@/contexts/OutletContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendors, useSales, useOutlets } from '@/hooks/useSupabaseData';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Users, TrendingUp, DollarSign, Package, MapPin, Building2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { selectedOutletId, isAllOutlets, selectedOutlet } = useOutletContext();
  const { t } = useLanguage();
  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: sales = [], isLoading: sLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);
  const { data: outlets = [], isLoading: oLoading } = useOutlets();

  // Live updates
  useRealtimeSubscription(['sales', 'allocations', 'payments']);

  const isLoading = vLoading || sLoading || oLoading;

  const activeVendors = (vendors as any[]).filter(v => v.status === 'active').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = (sales as any[]).filter(s => s.date === todayStr);
  const todayTotal = todaySales.reduce((s, r) => s + Number(r.total_value), 0);
  const todayCash = todaySales.reduce((s, r) => s + Number(r.amount_paid), 0);
  const totalOutstanding = todaySales.reduce((s, r) => s + Number(r.outstanding), 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyData = last7.map(date => {
    const daySales = (sales as any[]).filter(s => s.date === date);
    return {
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      sales: daySales.reduce((s, r) => s + Number(r.total_value), 0),
      cash: daySales.reduce((s, r) => s + Number(r.amount_paid), 0),
    };
  });

  const paymentBreakdown = [
    { name: t('cash'), value: todayCash || 65, color: 'hsl(210, 80%, 45%)' },
    { name: t('outstanding'), value: totalOutstanding || 10, color: 'hsl(38, 92%, 50%)' },
  ];

  const vendorSalesMap: Record<string, number> = {};
  (sales as any[]).forEach(s => { vendorSalesMap[s.vendor_id] = (vendorSalesMap[s.vendor_id] || 0) + Number(s.total_value); });
  const topPerformers = (vendors as any[])
    .map(v => ({ ...v, totalSales: vendorSalesMap[v.id] || Number(v.total_sales) || 0 }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {isAllOutlets ? t('companyWideOverview') : `${selectedOutlet?.name} ${t('outlet')}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('activeVendors')}</p><p className="text-2xl font-bold">{activeVendors}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10"><TrendingUp className="h-5 w-5 text-secondary" /></div><div><p className="text-sm text-muted-foreground">{t('todaySales')}</p><p className="text-2xl font-bold">₦{todayTotal.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10"><DollarSign className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">{t('cashCollected')}</p><p className="text-2xl font-bold">₦{todayCash.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10"><Package className="h-5 w-5 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">{t('outstanding')}</p><p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      {isAllOutlets && outlets.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> {t('outletsOverview')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {outlets.map((o: any) => {
                const oVendors = (vendors as any[]).filter(v => v.outlet_id === o.id && v.status === 'active').length;
                const oSales = (sales as any[]).filter(s => s.outlet_id === o.id && s.date === todayStr).reduce((s, r) => s + Number(r.total_value), 0);
                return (
                  <div key={o.id} className="rounded-lg border p-3 space-y-2">
                    <p className="font-medium text-sm truncate">{o.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">{t('vendorsCount')}</p><p className="font-bold text-lg">{oVendors}</p></div>
                      <div><p className="text-muted-foreground">{t('salesToday')}</p><p className="font-bold text-sm">₦{oSales.toLocaleString()}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t('weeklySalesTrend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cash" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('paymentBreakdown')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
                  {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {paymentBreakdown.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('topPerformers')}{!isAllOutlets && selectedOutlet ? ` — ${selectedOutlet.name}` : ''}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topPerformers.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">₦{v.totalSales.toLocaleString()}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{v.territory}</Badge>
              </div>
            ))}
            {topPerformers.length === 0 && <p className="text-sm text-muted-foreground col-span-5 text-center py-4">{t('noSalesDataYet')}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
