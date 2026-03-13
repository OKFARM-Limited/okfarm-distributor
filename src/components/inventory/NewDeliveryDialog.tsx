import { useState } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useProducts, useCreateDelivery } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface NewDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export default function NewDeliveryDialog({ open, onOpenChange }: NewDeliveryDialogProps) {
  const { selectedOutletId } = useOutletContext();
  const { data: products = [] } = useProducts();
  const createDelivery = useCreateDelivery();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('FanMilk');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [creditDays, setCreditDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'product_id') {
        const product = (products as any[]).find(p => p.id === value);
        return { ...item, product_id: value as string, unit_price: product?.unit_price || 0 };
      }
      return { ...item, [field]: Number(value) };
    }));
  };

  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const dueDate = format(addDays(new Date(date), creditDays), 'yyyy-MM-dd');

  const handleSubmit = async () => {
    if (!invoiceNumber.trim()) {
      toast({ title: 'Missing invoice number', variant: 'destructive' });
      return;
    }
    if (!supplier.trim()) {
      toast({ title: 'Missing supplier', variant: 'destructive' });
      return;
    }

    const validItems = items.filter(i => i.product_id && i.quantity > 0);

    try {
      await createDelivery.mutateAsync({
        delivery: {
          invoice_number: invoiceNumber.trim(),
          supplier: supplier.trim(),
          date,
          credit_term_days: creditDays,
          due_date: dueDate,
          total_value: totalValue,
          notes: notes || null,
          outlet_id: selectedOutletId && selectedOutletId !== 'all' ? selectedOutletId : null,
          status: 'pending',
        },
        items: validItems,
      });
      toast({ title: '✅ Delivery Created', description: `Invoice ${invoiceNumber} recorded.` });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setInvoiceNumber('');
    setSupplier('FanMilk');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCreditDays(30);
    setNotes('');
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Delivery</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNo">Invoice Number *</Label>
            <Input id="invoiceNo" placeholder="e.g. INV-2026-0308" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier">Supplier *</Label>
            <Input id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Delivery Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="creditDays">Credit Term (days)</Label>
            <Input id="creditDays" type="number" min={0} value={creditDays} onChange={e => setCreditDays(Number(e.target.value))} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Line Items</Label>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-3 w-3 mr-1" /> Add Item
            </Button>
          </div>

          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-28">Unit Price</TableHead>
                  <TableHead className="w-28 text-right">Subtotal</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select value={item.product_id} onValueChange={v => updateItem(idx, 'product_id', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(products as any[]).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} className="h-8 text-xs" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step={0.01} className="h-8 text-xs" value={item.unit_price || ''} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                    </TableCell>
                    <TableCell className="text-right text-sm">₦{(item.quantity * item.unit_price).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No items added yet. Click "Add Item" to add delivery line items.</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-3 mt-2">
          <div className="text-muted-foreground">Due Date: <span className="font-medium text-foreground">{dueDate}</span></div>
          <div className="font-bold text-lg">Total: ₦{totalValue.toLocaleString()}</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createDelivery.isPending}>
            {createDelivery.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save Delivery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
