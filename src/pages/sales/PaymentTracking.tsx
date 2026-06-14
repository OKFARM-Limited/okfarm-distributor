import { useOutletContext } from '@/contexts/OutletContext';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useSales } from '@/hooks/useSupabaseData';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

export default function PaymentTracking() {
  const [dateFilter, setDateFilter] = useState('');
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: sales = [], isLoading } = useSales(isAllOutlets ? 'all' : selectedOutletId);

  const outstanding = (sales as any[]).filter(s => Number(s.outstanding) > 0);
  const filtered = dateFilter ? outstanding.filter(s => s.date?.includes(dateFilter)) : outstanding;
  const totalDues = filtered.reduce((s, r) => s + Number(r.outstanding), 0);
  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage, resetPage } = usePagination(filtered, 20);
  useEffect(() => { resetPage(); }, [dateFilter]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payment Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Total Outstanding: <span className="font-bold text-destructive">₦{totalDues.toLocaleString()}</span>
            {!isAllOutlets && <span className="flex items-center gap-1 inline-flex ml-2"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</span>}
          </p>
        </div>
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="sm:w-48" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                {isAllOutlets && <TableHead>Outlet</TableHead>}
                <TableHead>Total Sale</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell className="font-medium">{s.vendors?.name}</TableCell>
                  {isAllOutlets && <TableCell className="text-xs">{s.outlets?.name || '—'}</TableCell>}
                  <TableCell>₦{Number(s.total_value).toLocaleString()}</TableCell>
                  <TableCell>₦{Number(s.amount_paid).toLocaleString()}</TableCell>
                  <TableCell className="text-destructive font-medium">₦{Number(s.outstanding).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.payment_method?.replace('_', ' ')}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={isAllOutlets ? 7 : 6} className="text-center text-muted-foreground py-8">No outstanding payments found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={goToPage} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
    </div>
  );
}
