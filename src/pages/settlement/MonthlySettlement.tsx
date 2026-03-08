import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { inboundDeliveries, salesRecords } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const months = ['2026-01', '2026-02', '2026-03'];

interface SettlementLine {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  creditDays: number;
  dueDate: string;
  status: 'paid' | 'due' | 'overdue';
  amountPaid: number;
}

const generateSettlement = (month: string): SettlementLine[] => {
  return inboundDeliveries.map((d, i) => {
    const isPaid = i >= 5;
    const isOverdue = !isPaid && new Date(d.dueDate) < new Date();
    return {
      invoiceId: d.id,
      invoiceNumber: d.invoiceNumber,
      date: d.date,
      amount: d.totalValue,
      creditDays: d.creditTermDays,
      dueDate: d.dueDate,
      status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'due',
      amountPaid: isPaid ? d.totalValue : Math.floor(d.totalValue * (Math.random() * 0.5)),
    };
  });
};

export default function MonthlySettlement() {
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const { toast } = useToast();
  const lines = generateSettlement(selectedMonth);

  const totalReceivables = lines.reduce((s, l) => s + l.amount, 0);
  const totalPaid = lines.reduce((s, l) => s + l.amountPaid, 0);
  const totalOutstanding = totalReceivables - totalPaid;
  const overdueCount = lines.filter(l => l.status === 'overdue').length;

  // Volume discount calculation
  const totalMonthlySales = salesRecords.filter(s => s.date.startsWith(selectedMonth)).reduce((s, r) => s + r.totalValue, 0);
  const discountRate = totalMonthlySales >= 5000000 ? 0.05 : totalMonthlySales >= 2000000 ? 0.03 : 0.01;
  const volumeDiscount = Math.round(totalReceivables * discountRate);
  const netPayable = totalOutstanding - volumeDiscount;

  const statusIcon = { paid: <CheckCircle className="h-4 w-4 text-green-500" />, due: <Clock className="h-4 w-4 text-yellow-500" />, overdue: <AlertTriangle className="h-4 w-4 text-red-500" /> };
  const statusVariant = { paid: 'default' as const, due: 'secondary' as const, overdue: 'destructive' as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Settlement</h1>
          <p className="text-muted-foreground">Depot-level reconciliation with FanMilk</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast({ title: 'Exported', description: 'Settlement report downloaded.' })}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Receivables</p>
          <p className="text-xl font-bold text-foreground">₦{totalReceivables.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="text-xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="text-xl font-bold text-destructive">₦{totalOutstanding.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Volume Discount ({(discountRate * 100).toFixed(0)}%)</p>
          <p className="text-xl font-bold text-primary">-₦{volumeDiscount.toLocaleString()}</p>
        </CardContent></Card>
        <Card className="border-primary"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Net Payable</p>
          <p className="text-xl font-bold text-foreground">₦{netPayable.toLocaleString()}</p>
        </CardContent></Card>
      </div>

      {/* Credit Terms */}
      <Card>
        <CardHeader><CardTitle className="text-base">Credit Terms & Payment Progress</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment progress</span>
            <span className="font-medium">{Math.round((totalPaid / totalReceivables) * 100)}%</span>
          </div>
          <Progress value={(totalPaid / totalReceivables) * 100} className="h-3" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Credit Term: 30 days</span>
            <span>•</span>
            <span>Overdue Invoices: {overdueCount}</span>
            <span>•</span>
            <span>Discount Tier: {discountRate >= 0.05 ? 'Platinum' : discountRate >= 0.03 ? 'Gold' : 'Standard'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Invoice Breakdown</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Credit Days</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map(l => (
                <TableRow key={l.invoiceId}>
                  <TableCell className="font-mono text-xs">{l.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{l.date}</TableCell>
                  <TableCell className="font-medium">₦{l.amount.toLocaleString()}</TableCell>
                  <TableCell>{l.creditDays}d</TableCell>
                  <TableCell className="text-sm">{l.dueDate}</TableCell>
                  <TableCell className="text-green-600">₦{l.amountPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">₦{(l.amount - l.amountPaid).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[l.status]} className="gap-1">
                      {statusIcon[l.status]}{l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
