import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vendors, salesRecords, dailyMetrics, allocations, getOutletName } from '@/data/mockData';
import { useOutletContext } from '@/contexts/OutletContext';
import { Users, TrendingUp, DollarSign, Package, AlertTriangle, CheckCircle, MapPin, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { selectedOutletId, isAllOutlets, selectedOutlet } = useOutletContext();

  const filteredVendors = isAllOutlets ? vendors : vendors.filter(v => v.outletId === selectedOutletId);
  const filteredSales = isAllOutlets ? salesRecords : salesRecords.filter(s => s.outletId === selectedOutletId);
  const filteredMetrics = isAllOutlets
    ? aggregateMetrics(dailyMetrics)
    : dailyMetrics.filter(m => m.outletId === selectedOutletId);

  const activeVendors = filteredVendors.filter(v => v.status === 'active').length;
  const todayMetrics = filteredMetrics[filteredMetrics.length - 1];
  const topPerformers = [...filteredVendors].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

  const todayStr = new Date().toISOString().split('T')[0];
  const totalOutstanding = filteredSales.filter(s => s.date === todayStr).reduce((s, r) => s + r.outstanding, 0);

  const paymentBreakdown = [
    { name: 'Cash', value: 65, color: 'hsl(210, 80%, 45%)' },
    { name: 'Mobile Money', value: 25, color: 'hsl(152, 55%, 42%)' },
    { name: 'Outstanding', value: 10, color: 'hsl(38, 92%, 50%)' },
  ];

  const weeklyData = filteredMetrics.slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    sales: d.totalSales,
    cash: d.cashCollected,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {isAllOutlets ? 'Company-Wide Overview' : `${selectedOutlet?.name} Outlet`}
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/30 px-4 py-2 text-sm flex-1">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <span>3 vendors have not reported today's sales{!isAllOutlets && ` in ${selectedOutlet?.name}`}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm flex-1">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span>FanYogo Strawberry low stock{!isAllOutlets ? ` in ${selectedOutlet?.name}` : ' in Epe'} — 15 packs left</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold">{activeVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold">₦{(todayMetrics?.totalSales || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash Collected</p>
                <p className="text-2xl font-bold">₦{(todayMetrics?.cashCollected || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Package className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outlets Overview — only in "All" mode */}
      {isAllOutlets && <OutletsOverview />}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Bar dataKey="sales" fill="hsl(210, 80%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cash" fill="hsl(152, 55%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
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
                  {p.name} ({p.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performers{!isAllOutlets && ` — ${selectedOutlet?.name}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topPerformers.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">₦{v.totalSales.toLocaleString()}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{v.territory}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OutletsOverview() {
  const outletIds = ['sangotedo', 'abraham-adesanya', 'epe', 'ogombo', 'eleko'];

  const outletData = outletIds.map(id => {
    const outletVendors = vendors.filter(v => v.outletId === id);
    const outletSales = salesRecords.filter(s => s.outletId === id);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = outletSales.filter(s => s.date === todayStr).reduce((s, r) => s + r.totalValue, 0);
    const outstanding = outletSales.filter(s => s.date === todayStr).reduce((s, r) => s + r.outstanding, 0);
    return {
      id,
      name: getOutletName(id),
      activeVendors: outletVendors.filter(v => v.status === 'active').length,
      todaySales,
      outstanding,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Outlets Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {outletData.map(o => (
            <div key={o.id} className="rounded-lg border p-3 space-y-2">
              <p className="font-medium text-sm truncate">{o.name}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Vendors</p>
                  <p className="font-bold text-lg">{o.activeVendors}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sales Today</p>
                  <p className="font-bold text-sm">₦{o.todaySales.toLocaleString()}</p>
                </div>
              </div>
              {o.outstanding > 0 && (
                <p className="text-xs text-destructive">₦{o.outstanding.toLocaleString()} outstanding</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to aggregate daily metrics across outlets
function aggregateMetrics(metrics: typeof dailyMetrics) {
  const byDate: Record<string, { date: string; totalSales: number; vendorsActive: number; cashCollected: number; mobileMoneyCollected: number; outletId: string }> = {};
  metrics.forEach(m => {
    if (!byDate[m.date]) {
      byDate[m.date] = { date: m.date, totalSales: 0, vendorsActive: 0, cashCollected: 0, mobileMoneyCollected: 0, outletId: 'all' };
    }
    byDate[m.date].totalSales += m.totalSales;
    byDate[m.date].vendorsActive += m.vendorsActive;
    byDate[m.date].cashCollected += m.cashCollected;
    byDate[m.date].mobileMoneyCollected += m.mobileMoneyCollected;
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}
