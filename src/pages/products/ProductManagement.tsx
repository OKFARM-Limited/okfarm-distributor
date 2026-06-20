import { useState, useMemo } from 'react';
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
import {
  Plus, Pencil, Trash2, Package, Loader2, Search, Filter, Download,
  BarChart3, Tag, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';
import { NairaIcon } from '@/components/NairaIcon';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { usePagination } from '@/hooks/usePagination';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';

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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: products = [], isLoading } = useProducts();
  const { viewerProps } = useViewerGuard();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();

  const openNew = () => { setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p) => {
    setForm({ id: p.id, name: p.name, sku: p.sku, category: p.category, unit: p.unit, unit_price: Number(p.unit_price), barcode: p.barcode || '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) {
      toast({ title: 'Error', description: 'Name and SKU are required', variant: 'destructive' });
      return;
    }
    const payload: Record<string, unknown> = { name: form.name, sku: form.sku, category: form.category, unit: form.unit, unit_price: form.unit_price, barcode: form.barcode || null };
    if (form.id) payload.id = form.id;
    upsertProduct.mutate(payload, {
      onSuccess: () => { toast({ title: '✅ Saved', description: `${form.name} saved.` }); setDialogOpen(false); },
      onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => { toast({ title: '🗑️ Deleted', description: 'Product removed.' }); setDeleteId(null); },
      onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  // Filter products
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(filtered, 10);

  // KPIs
  const kpis = useMemo(() => {
    const total = products.length;
    const categories = [...new Set(products.map(p => p.category))].length;
    const avgPrice = total > 0 ? products.reduce((s, p) => s + Number(p.unit_price), 0) / total : 0;
    const highestPrice = products.reduce((max, p) => Math.max(max, Number(p.unit_price)), 0);
    return { total, categories, avgPrice, highestPrice };
  }, [products]);

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpiCards = [
    { label: 'Total Products', value: kpis.total.toString(), icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Categories', value: kpis.categories.toString(), icon: Tag, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Avg. Price', value: `₦${Math.round(kpis.avgPrice).toLocaleString()}`, icon: NairaIcon, color: 'bg-amber-50 text-amber-600' },
    { label: 'Highest Price', value: `₦${kpis.highestPrice.toLocaleString()}`, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your product catalog, pricing and SKU information.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export"
            onExportCSV={() => {
              downloadCSV(
                [
                  { header: 'Name', key: 'name' },
                  { header: 'SKU', key: 'sku' },
                  { header: 'Category', key: 'category' },
                  { header: 'Unit', key: 'unit' },
                  { header: 'Unit Price (₦)', key: 'unit_price' },
                  { header: 'Barcode', key: 'barcode' },
                ],
                filtered,
                `products_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: `${filtered.length} products exported.` });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Product Catalog Report',
                subtitle: `Generated ${new Date().toLocaleDateString()} — ${filtered.length} products`,
                filename: `products_${new Date().toISOString().split('T')[0]}.pdf`,
                columns: [
                  { header: 'Name', key: 'name' },
                  { header: 'SKU', key: 'sku' },
                  { header: 'Category', key: 'category' },
                  { header: 'Unit', key: 'unit' },
                  { header: 'Unit Price (NGN)', key: 'unit_price', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Barcode', key: 'barcode' },
                ],
                data: filtered,
                summaryRows: [
                  { label: 'Total Products', value: filtered.length.toString() },
                  { label: 'Average Price (NGN)', value: `NGN ${Math.round(kpis.avgPrice).toLocaleString()}` },
                ],
              });
              toast({ title: 'PDF Downloaded', description: `${filtered.length} products exported.` });
            }}
          />
          <Button size="sm" onClick={openNew} {...viewerProps}><Plus className="h-4 w-4 mr-1.5" />Add Product</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${kpi.color} mb-2`}><kpi.icon className="h-5 w-5" /></div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-bold text-xl">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"><input type="checkbox" className="rounded" /></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Price (₦)</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map(p => (
                <TableRow key={p.id}>
                  <TableCell onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                  <TableCell className="text-sm capitalize">{p.unit}</TableCell>
                  <TableCell className="text-right text-sm font-medium">₦{Number(p.unit_price).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.barcode || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No products found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
            <span>Showing {Math.min(((currentPage - 1) * 10) + 1, totalItems)} to {Math.min(currentPage * 10, totalItems)} of {totalItems} products</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => goToPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
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
