import { commissions } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CommissionCalculator() {
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.totalCommission, 0);
  const totalDisbursed = commissions.filter(c => c.status === 'disbursed').reduce((s, c) => s + c.totalCommission, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Commission Calculator</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Commissions</p><p className="text-xl font-bold">₦{(totalPending + totalDisbursed).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-warning">₦{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-xl font-bold text-success">₦{totalDisbursed.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">February 2026 Commissions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Days Worked</TableHead>
                <TableHead>Volume Bonus</TableHead>
                <TableHead>Consistency</TableHead>
                <TableHead>Total Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.vendorName}</TableCell>
                  <TableCell>₦{c.totalSales.toLocaleString()}</TableCell>
                  <TableCell>{c.daysWorked}</TableCell>
                  <TableCell>₦{c.volumeBonus.toLocaleString()}</TableCell>
                  <TableCell>₦{c.consistencyBonus.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">₦{c.totalCommission.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === 'disbursed' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
