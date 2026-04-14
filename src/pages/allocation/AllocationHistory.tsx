import { useState, useEffect } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useAllocations } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Loader2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

export default function AllocationHistory() {
  const [dateFilter, setDateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: allocations = [], isLoading } = useAllocations(isAllOutlets ? 'all' : selectedOutletId);

  const filtered = allocations.filter((a: any) => {
    const matchDate = !dateFilter || a.date?.includes(dateFilter);
    const matchVendor = !vendorFilter || a.vendors?.name?.toLowerCase().includes(vendorFilter.toLowerCase());
    return matchDate && matchVendor;
  });
  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage, resetPage } = usePagination(filtered, 20);
  useEffect(() => { resetPage(); }, [dateFilter, vendorFilter]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Allocation History</h1>
        {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="sm:w-48" />
        <Input placeholder="Filter by vendor name..." value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} className="sm:w-64" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.date}</TableCell>
                  <TableCell className="font-medium">{a.vendors?.name}</TableCell>
                  <TableCell className="text-xs">{a.outlets?.name || '—'}</TableCell>
                  <TableCell>{a.allocation_items?.length || 0} SKUs</TableCell>
                  <TableCell className="text-right">₦{Number(a.total_value).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={a.status === 'reconciled' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No allocations found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={goToPage} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
    </div>
  );
}
