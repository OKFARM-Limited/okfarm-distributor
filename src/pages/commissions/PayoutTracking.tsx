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
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
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
              {paginatedItems.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendors?.name}</TableCell>
                  <TableCell>{c.month}</TableCell>
                  <TableCell className="font-bold">₦{Number(c.total_commission).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                  <TableCell>
                    {c.status !== 'disbursed' && (
                      <Button size="sm" onClick={() => handleDisburse(c)} disabled={createPayout.isPending} {...viewerProps}>
                        {createPayout.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        Disburse
                      </Button>
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
