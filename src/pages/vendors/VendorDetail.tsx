import { useParams, useNavigate } from 'react-router-dom';
import { vendors, assets, salesRecords, allocations } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, MapPin, Fingerprint, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendor = vendors.find(v => v.id === id);

  if (!vendor) return <div className="p-8 text-center text-muted-foreground">Vendor not found</div>;

  const vendorAssets = assets.filter(a => a.assignedTo === vendor.id);
  const vendorSales = salesRecords.filter(s => s.vendorId === vendor.id).slice(0, 14);
  const salesChart = vendorSales.reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
    value: s.totalValue,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/vendors')} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </Button>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={vendor.photo} />
                <AvatarFallback>{vendor.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <p className="text-sm text-muted-foreground">{vendor.id}</p>
                <Badge className="mt-1" variant={vendor.status === 'active' ? 'default' : 'destructive'}>{vendor.status}</Badge>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{vendor.phone}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{vendor.territory}</p>
                  {vendor.biometricsEnabled && <p className="flex items-center gap-2 text-success"><Fingerprint className="h-4 w-4" />Biometrics Enabled</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:w-64">
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Sales</p><p className="text-lg font-bold">₦{vendor.totalSales.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Days Worked</p><p className="text-lg font-bold">{vendor.daysWorked}</p></CardContent></Card>
        </div>
      </div>

      {/* Assets */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Assigned Assets</CardTitle></CardHeader>
        <CardContent>
          {vendorAssets.length === 0 ? <p className="text-sm text-muted-foreground">No assets assigned</p> : (
            <div className="flex flex-wrap gap-2">
              {vendorAssets.map(a => (
                <Badge key={a.id} variant="outline" className="px-3 py-1.5">
                  {a.name} ({a.type.replace('_', ' ')}) — {a.condition}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Sales Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesChart}>
              <XAxis dataKey="date" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="hsl(210, 80%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
