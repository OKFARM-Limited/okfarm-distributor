import { useState } from 'react';
import { salesRecords, getOutletName } from '@/data/mockData';
import { useOutletContext } from '@/contexts/OutletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function PaymentTracking() {
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState('');
  const { selectedOutletId, isAllOutlets } = useOutletContext();

  const outletFiltered = isAllOutlets ? salesRecords : salesRecords.filter(s => s.outletId === selectedOutletId);
  const outstanding = outletFiltered.filter(s => s.outstanding > 0 && !paidIds.has(s.id));
  const filtered = dateFilter ? outstanding.filter(s => s.date.includes(dateFilter)) : outstanding.slice(0, 30);

  const markPaid = (id: string) => {
    setPaidIds(prev => new Set(prev).add(id));
    toast({ title: 'Payment Marked', description: 'Dues cleared successfully.' });
  };

  const totalDues = filtered.reduce((s, r) => s + r.outstanding, 0);

  return (
    <div className="space-y-4 animate-fade-in">
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell className="font-medium">{s.vendorName}</TableCell>
                  {isAllOutlets && <TableCell className="text-xs">{getOutletName(s.outletId)}</TableCell>}
                  <TableCell>₦{s.totalValue.toLocaleString()}</TableCell>
                  <TableCell>₦{s.amountPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive font-medium">₦{s.outstanding.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.paymentMethod.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => markPaid(s.id)}>Mark Paid</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
