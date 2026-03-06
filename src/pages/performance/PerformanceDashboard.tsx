import { vendors, dailyMetrics, salesRecords, products, checkInRecords } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, AlertTriangle, TrendingUp, Users, Calendar, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const activeCount = vendors.filter(v => v.status === 'active').length;

// Attendance calculations from check-in records
const today = new Date().toISOString().split('T')[0];
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - i);
  return d.toISOString().split('T')[0];
});

const todayCheckIns = checkInRecords.filter(c => c.date === today);
const todayAttendanceRate = Math.round((todayCheckIns.length / activeCount) * 100);

const vendorAttendance = vendors.filter(v => v.status === 'active').map(v => {
  const checkins = checkInRecords.filter(c => c.vendorId === v.id);
  const last7 = checkins.filter(c => last7Days.includes(c.date)).length;
  const last30 = checkins.length;
  const avgCheckIn = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + parseInt(c.checkInTime.split(':')[0]) * 60 + parseInt(c.checkInTime.split(':')[1]), 0) / checkins.length
    : 0;
  return { ...v, attendanceLast7: last7, attendanceLast30: last30, attendanceRate30: Math.round((last30 / 30) * 100), avgCheckInMinutes: avgCheckIn };
});

const attendanceTrend = last7Days.reverse().map(date => {
  const count = checkInRecords.filter(c => c.date === date).length;
  return {
    date: new Date(date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
    present: count,
    absent: activeCount - count,
    rate: Math.round((count / activeCount) * 100),
  };
});

const avgDailySales = Math.round(dailyMetrics.reduce((s, d) => s + d.totalSales, 0) / dailyMetrics.length);
const topPerformers = [...vendors].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

const skuTotals = products.map(p => {
  const total = salesRecords.reduce((s, r) => s + (r.items.find(i => i.productId === p.id)?.qtySold || 0), 0);
  return { name: p.name.split(' ').slice(0, 2).join(' '), total };
}).sort((a, b) => b.total - a.total);

const weeklyTrend = dailyMetrics.slice(-14).map(d => ({
  date: new Date(d.date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
  sales: d.totalSales,
  vendors: d.vendorsActive,
}));

const lowActivity = vendorAttendance.filter(v => v.attendanceRate30 < 40);

export default function PerformanceDashboard() {
  const navigate = useNavigate();

  const handleExport = () => {
    const csv = 'Vendor,Territory,Total Sales,Days Worked,Attendance Rate,Avg Check-In\n' +
      vendorAttendance.map(v => {
        const hrs = Math.floor(v.avgCheckInMinutes / 60);
        const mins = Math.round(v.avgCheckInMinutes % 60);
        return `${v.name},${v.territory},${v.totalSales},${v.daysWorked},${v.attendanceRate30}%,${hrs}:${String(mins).padStart(2, '0')}`;
      }).join('\n');
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Vendors</p><p className="text-2xl font-bold">{vendors.length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-secondary" /></div><div><p className="text-xs text-muted-foreground">Today's Attendance</p><p className="text-2xl font-bold">{todayAttendanceRate}%</p><p className="text-[10px] text-muted-foreground">{todayCheckIns.length}/{activeCount} checked in</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Avg Daily Sales</p><p className="text-2xl font-bold">₦{avgDailySales.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Award className="h-5 w-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Top Performer</p><p className="text-sm font-bold truncate">{topPerformers[0]?.name}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><Clock className="h-5 w-5 text-info" /></div><div><p className="text-xs text-muted-foreground">30-Day Avg Attendance</p><p className="text-2xl font-bold">{Math.round(vendorAttendance.reduce((s, v) => s + v.attendanceRate30, 0) / vendorAttendance.length)}%</p></div></CardContent></Card>
      </div>

      {/* Low Activity Alert */}
      {lowActivity.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 p-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Low Attendance Vendors (&lt;40% rate)</p>
            <p className="text-xs text-muted-foreground mt-1">{lowActivity.map(v => `${v.name} (${v.attendanceRate30}%)`).join(', ')}</p>
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
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance Trend (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceTrend}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(var(--success))" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                <Bar dataKey="total" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Attendance Table */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor Attendance Breakdown</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Last 7d</TableHead>
                  <TableHead>Last 30d</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Avg Check-In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorAttendance.sort((a, b) => b.attendanceRate30 - a.attendanceRate30).slice(0, 10).map(v => {
                  const hrs = Math.floor(v.avgCheckInMinutes / 60);
                  const mins = Math.round(v.avgCheckInMinutes % 60);
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-sm">{v.name}</TableCell>
                      <TableCell>{v.attendanceLast7}/7</TableCell>
                      <TableCell>{v.attendanceLast30}/30</TableCell>
                      <TableCell>
                        <Badge variant={v.attendanceRate30 >= 70 ? 'default' : v.attendanceRate30 >= 50 ? 'secondary' : 'destructive'}>
                          {v.attendanceRate30}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{hrs}:{String(mins).padStart(2, '0')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
