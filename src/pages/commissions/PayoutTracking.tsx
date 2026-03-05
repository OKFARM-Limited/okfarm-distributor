import { useState } from 'react';
import { commissions } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

export default function PayoutTracking() {
  const [disbursedIds, setDisbursedIds] = useState<Set<string>>(new Set(commissions.filter(c => c.status === 'disbursed').map(c => c.id)));

  const markDisbursed = (id: string) => {
    setDisbursedIds(prev => new Set(prev).add(id));
    toast({ title: 'Payout Disbursed', description: 'Mobile money transfer initiated (mock).' });
  };

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
              {commissions.map(c => {
                const isDisbursed = disbursedIds.has(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.vendorName}</TableCell>
                    <TableCell>{c.month}</TableCell>
                    <TableCell className="font-bold">₦{c.totalCommission.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={isDisbursed ? 'default' : 'secondary'}>{isDisbursed ? 'disbursed' : 'pending'}</Badge></TableCell>
                    <TableCell>
                      {!isDisbursed && <Button size="sm" onClick={() => markDisbursed(c.id)}>Disburse</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
