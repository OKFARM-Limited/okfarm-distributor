import { useCommissions, useCreatePayout } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function PayoutTracking() {
  const { data: commissions = [], isLoading } = useCommissions('all');
  const createPayout = useCreatePayout();
  const { viewerProps } = useViewerGuard();

  const handleDisburse = (commission: any) => {
    createPayout.mutate(
      {
        commission_id: commission.id,
        vendor_id: commission.vendor_id,
        amount: Number(commission.total_commission),
        method: 'mobile_money',
        reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
        disbursed_at: new Date().toISOString(),
        status: 'completed',
      },
      {
        onSuccess: () => toast({ title: 'Payout Disbursed', description: `₦${Number(commission.total_commission).toLocaleString()} sent to ${commission.vendors?.name}` }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Payout Tracking</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(commissions as any[]).map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendors?.name}</TableCell>
                  <TableCell>{c.month}</TableCell>
                  <TableCell className="font-bold">₦{Number(c.total_commission).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                  <TableCell>
                    {c.status !== 'disbursed' && (
                      <Button size="sm" onClick={() => handleDisburse(c)} disabled={createPayout.isPending}>
                        {createPayout.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        Disburse
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(commissions as any[]).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No commissions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
