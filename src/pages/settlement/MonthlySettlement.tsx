import { useOutletContext } from '@/contexts/OutletContext';
import { useSettlements } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MonthlySettlement() {
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: settlements = [], isLoading } = useSettlements(isAllOutlets ? 'all' : selectedOutletId);
  const { toast } = useToast();

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const latest = (settlements as any[])[0];
  const lines = latest?.settlement_lines || [];

  const totalReceivable = Number(latest?.total_receivable || 0);
  const totalPaid = Number(latest?.total_paid || 0);
  const totalOutstanding = totalReceivable - totalPaid;
  const discount = Number(latest?.discount || 0);
  const discountRate = Number(latest?.discount_rate || 0);
  const netPayable = Number(latest?.net_payable || 0);
  const overdueCount = lines.filter((l: any) => l.status === 'overdue').length;

  const statusIcon: Record<string, React.ReactNode> = { paid: <CheckCircle className="h-4 w-4 text-green-500" />, due: <Clock className="h-4 w-4 text-yellow-500" />, overdue: <AlertTriangle className="h-4 w-4 text-red-500" /> };
  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = { paid: 'default', due: 'secondary', overdue: 'destructive' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Settlement</h1>
          <p className="text-muted-foreground">{latest ? `${latest.month} — ${latest.outlets?.name || 'All Outlets'}` : 'No settlement data yet'}</p>
        </div>
        <Button variant="outline" onClick={() => toast({ title: 'Exported', description: 'Settlement report downloaded.' })}>
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>

      {latest ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Receivables</p><p className="text-xl font-bold text-foreground">₦{totalReceivable.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-destructive">₦{totalOutstanding.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Volume Discount ({(discountRate * 100).toFixed(0)}%)</p><p className="text-xl font-bold text-primary">-₦{discount.toLocaleString()}</p></CardContent></Card>
            <Card className="border-primary"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Net Payable</p><p className="text-xl font-bold text-foreground">₦{netPayable.toLocaleString()}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Payment Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment progress</span><span className="font-medium">{totalReceivable ? Math.round((totalPaid / totalReceivable) * 100) : 0}%</span></div>
              <Progress value={totalReceivable ? (totalPaid / totalReceivable) * 100 : 0} className="h-3" />
              <div className="flex gap-4 text-xs text-muted-foreground"><span>Credit Term: 30 days</span><span>•</span><span>Overdue: {overdueCount}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Invoice Breakdown</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Credit</TableHead><TableHead>Due</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.invoice_number}</TableCell>
                      <TableCell className="text-sm">{l.date}</TableCell>
                      <TableCell className="font-medium">₦{Number(l.amount).toLocaleString()}</TableCell>
                      <TableCell>{l.credit_days}d</TableCell>
                      <TableCell className="text-sm">{l.due_date}</TableCell>
                      <TableCell className="text-green-600">₦{Number(l.amount_paid).toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">₦{(Number(l.amount) - Number(l.amount_paid)).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusVariant[l.status] || 'secondary'} className="gap-1">{statusIcon[l.status]}{l.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {lines.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No invoice lines.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No settlement data available yet. Settlements will appear here once created.</CardContent></Card>
      )}
    </div>
  );
}
