import { useCommissions, useCreatePayout, type DbCommission } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

export default function PayoutTracking() {
  const { data: commissions = [], isLoading } = useCommissions('all');
  const createPayout = useCreatePayout();
  const { viewerProps } = useViewerGuard();
  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(commissions, 20);

  const handleDisburse = (commission: DbCommission) => {
    createPayout.mutate(
      {
        commission_id: commission.id as string,
        vendor_id: commission.vendor_id as string,
        amount: Number(commission.total_commission),
        method: 'mobile_money',
        reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
        disbursed_at: new Date().toISOString(),
        status: 'completed',
      },
      {
        onSuccess: () => toast({ title: 'Payout Disbursed', description: `₦${Number(commission.total_commission).toLocaleString()} sent to ${commission.vendors?.name}` }),
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-muted-foreground text-sm">Track and disburse commission payouts to vendors.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Total Pending</p>
          <p className="font-bold text-xl">₦{commissions.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.total_commission), 0).toLocaleString()}</p>
          <p className="text-xs mt-0.5"><span className="text-amber-600 font-medium">{commissions.filter(c => c.status === 'pending').length}</span> <span className="text-muted-foreground">vendors</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Total Disbursed</p>
          <p className="font-bold text-xl">₦{commissions.filter(c => c.status === 'disbursed').reduce((s, c) => s + Number(c.total_commission), 0).toLocaleString()}</p>
          <p className="text-xs mt-0.5"><span className="text-emerald-600 font-medium">{commissions.filter(c => c.status === 'disbursed').length}</span> <span className="text-muted-foreground">completed</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="font-bold text-xl">{commissions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <p className="text-xs text-muted-foreground">Grand Total</p>
          <p className="font-bold text-xl">₦{commissions.reduce((s, c) => s + Number(c.total_commission), 0).toLocaleString()}</p>
        </CardContent></Card>
      </div>

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
              {paginatedItems.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendors?.name}</TableCell>
                  <TableCell>{c.month}</TableCell>
                  <TableCell className="font-bold">₦{Number(c.total_commission).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                  <TableCell>
                    {c.status !== 'disbursed' && (
                      <div title="Mobile Money integration coming soon">
                        <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
                          Disburse
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No commissions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={goToPage} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
    </div>
  );
}
