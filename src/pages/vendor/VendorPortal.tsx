import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Award, Calendar, TrendingUp } from 'lucide-react';

interface VendorData {
  vendor: Record<string, unknown>;
  sales: Record<string, unknown>[];
  allocations: Record<string, unknown>[];
  commissions: Record<string, unknown>[];
  checkIns: Record<string, unknown>[];
}

export default function VendorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VendorData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!vendor) { setData(null); setLoading(false); return; }

      const [sales, allocations, commissions, checkIns] = await Promise.all([
        supabase.from('sales').select('*').eq('vendor_id', vendor.id).order('date', { ascending: false }).limit(30),
        supabase.from('allocations').select('*').eq('vendor_id', vendor.id).order('date', { ascending: false }).limit(15),
        supabase.from('commissions').select('*').eq('vendor_id', vendor.id).order('month', { ascending: false }).limit(6),
        supabase.from('check_ins').select('*').eq('vendor_id', vendor.id).order('date', { ascending: false }).limit(15),
      ]);

      setData({
        vendor,
        sales: sales.data || [],
        allocations: allocations.data || [],
        commissions: commissions.data || [],
        checkIns: checkIns.data || [],
      });
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No vendor record is linked to your account.</p>
          <p className="text-sm mt-2">Contact your administrator to link your vendor profile.</p>
        </CardContent>
      </Card>
    );
  }

  const totalSales = data.sales.reduce((s, x) => s + Number(x.total_value || 0), 0);
  const outstanding = data.sales.reduce((s, x) => s + Number(x.outstanding || 0), 0);
  const lastCommission = data.commissions[0];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {data.vendor.name}</h1>
        <p className="text-sm text-muted-foreground">Vendor Code: {data.vendor.vendor_code}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><DollarSign className="h-4 w-4" /> Sales (30d)</div>
          <p className="text-xl font-bold mt-1">₦{totalSales.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="h-4 w-4" /> Outstanding</div>
          <p className="text-xl font-bold mt-1 text-destructive">₦{outstanding.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Award className="h-4 w-4" /> Last Commission</div>
          <p className="text-xl font-bold mt-1">₦{Number(lastCommission?.total_commission || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground capitalize">{lastCommission?.tier || '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Calendar className="h-4 w-4" /> Days Active</div>
          <p className="text-xl font-bold mt-1">{data.checkIns.length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sales</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Outstanding</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.sales.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No sales</TableCell></TableRow>}
              {data.sales.slice(0, 10).map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>₦{Number(s.total_value).toLocaleString()}</TableCell>
                  <TableCell>₦{Number(s.amount_paid).toLocaleString()}</TableCell>
                  <TableCell className={Number(s.outstanding) > 0 ? 'text-destructive' : ''}>₦{Number(s.outstanding).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.payment_method?.replace('_', ' ')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Commission History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Tier</TableHead><TableHead>Sales</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.commissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No commissions yet</TableCell></TableRow>}
              {data.commissions.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.month}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{c.tier}</Badge></TableCell>
                  <TableCell>₦{Number(c.total_sales).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">₦{Number(c.total_commission).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'paid' ? 'default' : 'secondary'} className="capitalize">{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
