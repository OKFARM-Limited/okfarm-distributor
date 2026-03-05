import { vendors, dailyMetrics, salesRecords, products } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, AlertTriangle, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const activeCount = vendors.filter(v => v.status === 'active').length;
const attendanceRate = Math.round((activeCount / vendors.length) * 100);
const avgDailySales = Math.round(dailyMetrics.reduce((s, d) => s + d.totalSales, 0) / dailyMetrics.length);
const topPerformers = [...vendors].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

// Top SKUs
const skuTotals = products.map(p => {
  const total = salesRecords.reduce((s, r) => s + (r.items.find(i => i.productId === p.id)?.qtySold || 0), 0);
  return { name: p.name.split(' ').slice(0, 2).join(' '), total };
}).sort((a, b) => b.total - a.total);

const weeklyTrend = dailyMetrics.slice(-14).map(d => ({
  date: new Date(d.date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
  sales: d.totalSales,
  vendors: d.vendorsActive,
}));

const lowActivity = vendors.filter(v => v.daysWorked < 10 && v.status === 'active');

export default function PerformanceDashboard() {
  const navigate = useNavigate();

  const handleExport = () => {
    const csv = 'Vendor,Territory,Total Sales,Days Worked\n' + vendors.map(v => `${v.name},${v.territory},${v.totalSales},${v.daysWorked}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance_report.csv';
    a.click();
    toast({ title: 'Report Exported', description: 'CSV file downloaded.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Vendors</p><p className="text-2xl font-bold">{vendors.length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-secondary" /></div><div><p className="text-xs text-muted-foreground">Attendance Rate</p><p className="text-2xl font-bold">{attendanceRate}%</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Avg Daily Sales</p><p className="text-2xl font-bold">₦{avgDailySales.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Award className="h-5 w-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Top Performer</p><p className="text-sm font-bold truncate">{topPerformers[0]?.name}</p></div></CardContent></Card>
      </div>

      {/* Low Activity Alert */}
      {lowActivity.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 p-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Low Activity Vendors</p>
            <p className="text-xs text-muted-foreground mt-1">{lowActivity.map(v => v.name).join(', ')} — fewer than 10 days worked this month</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Sales Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Sales Trend (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyTrend}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="sales" stroke="hsl(210, 80%, 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top SKUs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top SKUs by Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skuTotals.slice(0, 6)} layout="vertical">
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(152, 55%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top 5 Performers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/performance/${v.id}`)}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.territory} • {v.daysWorked} days</p>
                </div>
                <p className="font-bold text-sm">₦{v.totalSales.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
