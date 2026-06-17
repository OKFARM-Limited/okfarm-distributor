import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useSettlements, useCreateSettlement, useOutlets, useInboundDeliveries } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Loader2, Plus, FileDown } from 'lucide-react';
import { generatePDFReport } from '@/lib/generatePDF';
import { toast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

export default function MonthlySettlement() {
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: settlements = [], isLoading } = useSettlements(isAllOutlets ? 'all' : selectedOutletId);
  const { data: outlets = [] } = useOutlets();
  const { data: deliveries = [] } = useInboundDeliveries(isAllOutlets ? 'all' : selectedOutletId);
  const createSettlement = useCreateSettlement();
  const { viewerProps } = useViewerGuard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [newOutlet, setNewOutlet] = useState('');
  const [newDiscountRate, setNewDiscountRate] = useState(2.5);

  const handleCreate = () => {
    if (!newMonth || !newOutlet) {
      toast({ title: 'Error', description: 'Month and outlet are required', variant: 'destructive' });
      return;
    }
    // Auto-generate lines from deliveries for that month & outlet
    const monthDeliveries = deliveries.filter(
      d => d.outlet_id === newOutlet && d.date?.startsWith(newMonth.substring(0, 7))
    );
    const totalReceivable = monthDeliveries.reduce((s, d) => s + Number(d.total_value), 0);
    const discount = totalReceivable * (newDiscountRate / 100);
    const lines = monthDeliveries.map(d => ({
      invoice_number: d.invoice_number,
      date: d.date,
      due_date: d.due_date || d.date,
      amount: Number(d.total_value),
      amount_paid: 0,
      credit_days: d.credit_term_days || 30,
      status: 'due',
    }));

    createSettlement.mutate({
      outlet_id: newOutlet,
      month: newMonth,
      total_receivable: totalReceivable,
      total_paid: 0,
      discount_rate: newDiscountRate,
      discount,
      net_payable: totalReceivable - discount,
      status: 'open',
      lines,
    }, {
      onSuccess: () => { toast({ title: '✅ Created', description: 'Settlement created.' }); setDialogOpen(false); },
      onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const latest = settlements[0];
  const lines = latest?.settlement_lines || [];
  const totalReceivable = Number(latest?.total_receivable || 0);
  const totalPaid = Number(latest?.total_paid || 0);
  const totalOutstanding = totalReceivable - totalPaid;
  const discount = Number(latest?.discount || 0);
  const discountRate = Number(latest?.discount_rate || 0);
  const netPayable = Number(latest?.net_payable || 0);
  const overdueCount = lines.filter((l) => l.status === 'overdue').length;

  const statusIcon: Record<string, React.ReactNode> = { paid: <CheckCircle className="h-4 w-4 text-green-500" />, due: <Clock className="h-4 w-4 text-yellow-500" />, overdue: <AlertTriangle className="h-4 w-4 text-red-500" />, partial: <Clock className="h-4 w-4 text-orange-500" /> };
  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = { paid: 'default', due: 'secondary', overdue: 'destructive', partial: 'secondary' };

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Monthly Settlement</h1>
          <p className="text-muted-foreground text-sm">Manage supplier settlements, track receivables and monitor payment progress.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            if (!latest) return;
            generatePDFReport({
              title: 'Monthly Settlement Report',
              subtitle: `${latest.month} — ${latest.outlets?.name || 'All Outlets'}`,
              filename: `settlement-${latest.month}.pdf`,
              columns: [
                { header: 'Invoice', key: 'invoice_number' },
                { header: 'Date', key: 'date' },
                { header: 'Amount', key: 'amount', align: 'right', format: (v: number) => `₦${Number(v).toLocaleString()}` },
                { header: 'Credit', key: 'credit_days', align: 'center', format: (v: number) => `${v}d` },
                { header: 'Due Date', key: 'due_date' },
                { header: 'Paid', key: 'amount_paid', align: 'right', format: (v: number) => `₦${Number(v).toLocaleString()}` },
                { header: 'Balance', key: 'balance', align: 'right', format: (v: number) => `₦${Number(v).toLocaleString()}` },
                { header: 'Status', key: 'status' },
              ],
              data: lines.map((l) => ({ ...l, balance: Number(l.amount) - Number(l.amount_paid) })),
              summaryRows: [
                { label: 'Total Receivable', value: `₦${totalReceivable.toLocaleString()}` },
                { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}` },
                { label: `Discount (${discountRate}%)`, value: `-₦${discount.toLocaleString()}` },
                { label: 'Net Payable', value: `₦${netPayable.toLocaleString()}` },
              ],
            });
          }}>
            <FileDown className="h-4 w-4 mr-2" />Export PDF
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-1" {...viewerProps}><Plus className="h-4 w-4" /> New Settlement</Button>
        </div>
      </div>

      {latest ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Receivables</p><p className="text-xl font-bold text-foreground">₦{totalReceivable.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-destructive">₦{totalOutstanding.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Volume Discount ({discountRate}%)</p><p className="text-xl font-bold text-primary">-₦{discount.toLocaleString()}</p></CardContent></Card>
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
                  {lines.map((l) => (
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
        <Card><CardContent className="py-12 text-center text-muted-foreground">No settlement data available yet. Click "New Settlement" to create one.</CardContent></Card>
      )}

      {/* Create Settlement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Settlement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Month (YYYY-MM)</Label>
              <Input value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="e.g. 2026-03" />
            </div>
            <div className="space-y-2">
              <Label>Outlet</Label>
              <Select value={newOutlet} onValueChange={setNewOutlet}>
                <SelectTrigger><SelectValue placeholder="Select outlet" /></SelectTrigger>
                <SelectContent>
                  {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Rate (%)</Label>
              <Input type="number" min={0} max={100} step={0.5} value={newDiscountRate} onChange={e => setNewDiscountRate(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSettlement.isPending}>
              {createSettlement.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
