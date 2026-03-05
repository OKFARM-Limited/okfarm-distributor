import { useState } from 'react';
import { allocations } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AllocationHistory() {
  const [dateFilter, setDateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  const filtered = allocations.filter(a => {
    const matchDate = !dateFilter || a.date.includes(dateFilter);
    const matchVendor = !vendorFilter || a.vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
    return matchDate && matchVendor;
  }).slice(0, 50);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Allocation History</h1>
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
