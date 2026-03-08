import { useState } from 'react';
import { useProducts, useUpsertProduct, useDeleteProduct } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const CATEGORIES = ['Yogurt', 'Ice Cream', 'Popsicle', 'Juice', 'Milk'];
const UNITS = ['pack', 'box', 'carton', 'piece', 'sachet'];

interface ProductForm {
  id?: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unit_price: number;
  barcode: string;
}

const emptyForm: ProductForm = { name: '', sku: '', category: 'Yogurt', unit: 'pack', unit_price: 0, barcode: '' };

export default function ProductManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: products = [], isLoading } = useProducts();
  const { viewerProps } = useViewerGuard();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();

  const openNew = () => { setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setForm({ id: p.id, name: p.name, sku: p.sku, category: p.category, unit: p.unit, unit_price: Number(p.unit_price), barcode: p.barcode || '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) {
      toast({ title: 'Error', description: 'Name and SKU are required', variant: 'destructive' });
      return;
    }
    const payload: any = { name: form.name, sku: form.sku, category: form.category, unit: form.unit, unit_price: form.unit_price, barcode: form.barcode || null };
    if (form.id) payload.id = form.id;
    upsertProduct.mutate(payload, {
      onSuccess: () => { toast({ title: '✅ Saved', description: `${form.name} saved.` }); setDialogOpen(false); },
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => { toast({ title: '🗑️ Deleted', description: 'Product removed.' }); setDeleteId(null); },
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Product Management</h1>
        <Button onClick={openNew} className="gap-1" {...viewerProps}><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>₦{Number(p.unit_price).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.barcode || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Unit Price (₦)</Label><Input type="number" min={0} value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Barcode</Label><Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Optional" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsertProduct.isPending}>
              {upsertProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. Related allocation/sale items may be affected.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
