import { useState } from 'react';
import { allocations, getOutletName } from '@/data/mockData';
import { useOutletContext } from '@/contexts/OutletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';

export default function AllocationHistory() {
  const [dateFilter, setDateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const { selectedOutletId, isAllOutlets } = useOutletContext();

  const filtered = allocations.filter(a => {
    const matchDate = !dateFilter || a.date.includes(dateFilter);
    const matchVendor = !vendorFilter || a.vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
    const matchOutlet = isAllOutlets || a.outletId === selectedOutletId;
    return matchDate && matchVendor && matchOutlet;
  }).slice(0, 50);

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
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.date}</TableCell>
                  <TableCell className="font-medium">{a.vendorName}</TableCell>
                  <TableCell className="text-xs">{getOutletName(a.outletId)}</TableCell>
                  <TableCell>{a.items.length} SKUs</TableCell>
                  <TableCell className="text-right">₦{a.totalValue.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={a.status === 'reconciled' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
