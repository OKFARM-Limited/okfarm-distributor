import { useOutletContext } from '@/contexts/OutletContext';
import { useVendors, useSales, useCheckIns, useOutlets } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, AlertTriangle, TrendingUp, Users, Calendar, Award, Clock, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: vendors = [], isLoading: vLoading } = useVendors(isAllOutlets ? 'all' : selectedOutletId);
  const { data: sales = [], isLoading: sLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);
  const { data: checkIns = [], isLoading: cLoading } = useCheckIns();

  const isLoading = vLoading || sLoading || cLoading;

  const activeVendors = vendors.filter(v => v.status === 'active');
  const activeCount = activeVendors.length;

  const today = new Date().toISOString().split('T')[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const todayCheckIns = checkIns.filter(c => c.date === today);
  const todayAttendanceRate = activeCount ? Math.round((todayCheckIns.length / activeCount) * 100) : 0;

  // Attendance trend
  const attendanceTrend = [...last7Days].reverse().map(date => {
    const count = checkIns.filter(c => c.date === date).length;
    return {
      date: new Date(date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
      present: count, absent: Math.max(0, activeCount - count),
      rate: activeCount ? Math.round((count / activeCount) * 100) : 0,
    };
  });

  // Sales by date for trend
  const salesByDate: Record<string, number> = {};
  sales.forEach(s => {
    salesByDate[s.date] = (salesByDate[s.date] || 0) + Number(s.total_value);
  });
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();
  const salesTrend = last14Days.map(date => ({
    date: new Date(date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
    sales: salesByDate[date] || 0,
  }));
  const avgDailySales = salesTrend.length ? Math.round(salesTrend.reduce((s, d) => s + d.sales, 0) / salesTrend.length) : 0;

  // Top performers by total sales
  const vendorSalesMap: Record<string, number> = {};
  sales.forEach(s => {
    vendorSalesMap[s.vendor_id] = (vendorSalesMap[s.vendor_id] || 0) + Number(s.total_value);
  });
  const topPerformers = activeVendors
    .map(v => ({ ...v, totalSales: vendorSalesMap[v.id] || Number(v.total_sales) || 0 }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  const handleExport = () => {
    const csv = 'Vendor,Territory,Total Sales\n' +
      topPerformers.map(v => `${v.name},${v.territory},${v.totalSales}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'performance_report.csv'; a.click();
    toast({ title: 'Report Exported', description: 'CSV file downloaded.' });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Performance</h1>
          <p className="text-muted-foreground text-sm">Monitor vendor performance, attendance trends and sales analytics.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 mb-2"><Users className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Active Vendors</p>
          <p className="font-bold text-xl">{activeCount}</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">↑ 100%</span> <span className="text-muted-foreground">operational</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 mb-2"><Calendar className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Today's Attendance</p>
          <p className="font-bold text-xl">{todayAttendanceRate}%</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">{todayCheckIns.length}/{activeCount}</span> <span className="text-muted-foreground">checked in</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 text-amber-600 mb-2"><TrendingUp className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Avg Daily Sales</p>
          <p className="font-bold text-xl">₦{avgDailySales.toLocaleString()}</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">↑ 5.2%</span> <span className="text-muted-foreground">vs last week</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-50 text-purple-600 mb-2"><Award className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Top Performer</p>
          <p className="font-bold text-lg truncate">{topPerformers[0]?.name || '—'}</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">₦{(topPerformers[0]?.totalSales || 0).toLocaleString()}</span> <span className="text-muted-foreground">total sales</span></p>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Sales Trend (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesTrend}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Attendance Trend (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceTrend}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(var(--primary))" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top 5 Performers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/performance/${v.id}`)}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.territory} • {v.outlets?.name || ''}</p>
                </div>
                <p className="font-bold text-sm">₦{v.totalSales.toLocaleString()}</p>
              </div>
            ))}
            {topPerformers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sales data yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
