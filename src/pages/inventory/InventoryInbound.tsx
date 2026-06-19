import { useState, useRef, useMemo } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useInboundDeliveries, useUpdateDelivery, useStockLevels, useProducts, type DbDelivery } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Truck, Package, AlertTriangle, Eye, CheckCircle, Loader2, Upload, FileText, ExternalLink, Plus,
  Download, Search, Filter, DollarSign, XCircle, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import NewDeliveryDialog from '@/components/inventory/NewDeliveryDialog';
import InvoiceVerificationDialog from '@/components/inventory/InvoiceVerificationDialog';
import { usePagination } from '@/hooks/usePagination';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ExportMenu } from '@/components/ExportMenu';
import { downloadCSV, generatePDFReport } from '@/lib/exportUtils';

const CHART_COLORS = ['hsl(221, 100%, 50%)', 'hsl(152, 55%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 55%)', 'hsl(0, 72%, 51%)', 'hsl(210, 15%, 75%)'];

export default function InventoryInbound() {
  const [viewDelivery, setViewDelivery] = useState<DbDelivery | null>(null);
  const [showNewDelivery, setShowNewDelivery] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<Record<string, unknown> | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: deliveries = [], isLoading: dLoading } = useInboundDeliveries(isAllOutlets ? 'all' : selectedOutletId);
  const { data: stockLevels = [], isLoading: sLoading } = useStockLevels(isAllOutlets ? 'all' : selectedOutletId);
  const { data: products = [] } = useProducts();
  const updateDelivery = useUpdateDelivery();
  const { viewerProps, isViewer } = useViewerGuard();

  const totalStock = stockLevels.reduce((s, l) => s + l.current_stock, 0);
  const lowStockItems = stockLevels.filter(s => s.current_stock <= s.min_stock);
  const outOfStockItems = stockLevels.filter(s => s.current_stock === 0);
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const totalValue = stockLevels.reduce((s, l) => s + (l.current_stock * Number(l.products?.unit_price || 0)), 0);

  // Filter stock levels
  const filteredStock = useMemo(() => {
    let items = stockLevels;
    if (search) items = items.filter(s => (s.products?.name || '').toLowerCase().includes(search.toLowerCase()));
    if (activeTab === 'low') items = items.filter(s => s.current_stock > 0 && s.current_stock <= s.min_stock);
    if (activeTab === 'out') items = items.filter(s => s.current_stock === 0);
    return items;
  }, [stockLevels, search, activeTab]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(filteredStock, 8);

  // Category breakdown for donut
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    stockLevels.forEach(s => {
      const product = products.find(p => p.id === s.product_id);
      const cat = product?.category || 'Other';
      cats[cat] = (cats[cat] || 0) + (s.current_stock * Number(s.products?.unit_price || 0));
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [stockLevels, products]);

  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  const markReceived = (id: string) => {
    updateDelivery.mutate(
      { id, status: 'received', received_by: 'Depot Manager' },
      {
        onSuccess: () => toast({ title: '✅ Delivery Received', description: 'Delivery marked as received.' }),
        onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  const triggerUpload = (deliveryId: string) => {
    setUploadTargetId(deliveryId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) { toast({ title: 'File too large', description: 'Maximum file size is 10MB.', variant: 'destructive' }); return; }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { toast({ title: 'Invalid file type', description: 'Please upload a PDF or image file.', variant: 'destructive' }); return; }
    setUploading(uploadTargetId);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${uploadTargetId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(filePath);
      await updateDelivery.mutateAsync({ id: uploadTargetId, invoice_file_url: urlData.publicUrl });
      toast({ title: '✅ Invoice Uploaded', description: 'Invoice file has been attached. Verifying...' });
      const delivery = deliveries.find(d => d.id === uploadTargetId);
      if (delivery) runVerification(urlData.publicUrl, delivery);
    } catch (err: unknown) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
    } finally { setUploading(null); setUploadTargetId(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const runVerification = async (invoiceUrl: string, delivery: DbDelivery) => {
    setVerificationResult(null); setVerificationError(null); setVerificationLoading(true); setShowVerification(true);
    try {
      const deliveryData = {
        invoice_number: delivery.invoice_number, supplier: delivery.supplier, total_value: Number(delivery.total_value),
        items: (delivery.delivery_items || []).map((i: DbDelivery['delivery_items'][number]) => ({
          product_name: i.products?.name || 'Unknown', quantity: i.quantity, unit_price: Number(i.unit_price),
        })),
      };
      const { data, error } = await supabase.functions.invoke('verify-invoice', { body: { invoiceImageUrl: invoiceUrl, deliveryData } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVerificationResult(data);
    } catch (err: unknown) {
      setVerificationError((err as Error).message || 'Verification failed');
    } finally { setVerificationLoading(false); }
  };

  if (dLoading || sLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpiCards = [
    { label: 'Total Inventory Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'bg-blue-50 text-blue-600', trend: '6.3%', up: true, trendLabel: 'vs last month' },
    { label: 'Total Stock (Units)', value: totalStock.toLocaleString(), icon: Package, color: 'bg-emerald-50 text-emerald-600', trend: '8.7%', up: true, trendLabel: 'vs last month' },
    { label: 'In Stock (Units)', value: (totalStock - outOfStockItems.reduce((s, i) => s + 0, 0)).toLocaleString(), icon: CheckCircle, color: 'bg-purple-50 text-purple-600', trend: `${totalStock > 0 ? '85%' : '0%'}`, up: true, trendLabel: 'of total stock' },
    { label: 'Low Stock Items', value: lowStockItems.length.toString(), icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', trend: lowStockItems.length.toString(), up: false, trendLabel: 'Require attention' },
    { label: 'Out of Stock Items', value: outOfStockItems.length.toString(), icon: XCircle, color: 'bg-red-50 text-red-600', trend: outOfStockItems.length.toString(), up: false, trendLabel: 'Require attention' },
  ];

  const tabs = [
    { key: 'all', label: 'All Products', count: stockLevels.length },
    { key: 'low', label: 'Low Stock', count: lowStockItems.length },
    { key: 'out', label: 'Out of Stock', count: outOfStockItems.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileUpload} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm">Track stock levels, monitor inventory value and manage product availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            label="Export Report"
            onExportCSV={() => {
              downloadCSV(
                [
                  { header: 'Product', key: 'product_name' },
                  { header: 'Category', key: 'product_category' },
                  { header: 'Current Stock', key: 'current_stock' },
                  { header: 'Min Stock', key: 'min_stock' },
                  { header: 'Unit Price (₦)', key: 'unit_price' },
                  { header: 'Stock Value (₦)', key: 'stock_value' },
                  { header: 'Status', key: 'stock_status' },
                ],
                stockLevels.map(l => ({
                  product_name: l.products?.name || '-',
                  product_category: l.products?.category || '-',
                  current_stock: l.current_stock,
                  min_stock: l.min_stock,
                  unit_price: Number(l.products?.unit_price || 0),
                  stock_value: l.current_stock * Number(l.products?.unit_price || 0),
                  stock_status: l.current_stock === 0 ? 'Out of Stock' : l.current_stock <= l.min_stock ? 'Low Stock' : 'In Stock',
                })),
                `inventory_${new Date().toISOString().split('T')[0]}.csv`,
              );
              toast({ title: 'CSV Downloaded', description: `${stockLevels.length} stock items exported.` });
            }}
            onExportPDF={() => {
              generatePDFReport({
                title: 'Inventory Stock Report',
                subtitle: `Generated ${new Date().toLocaleDateString()}`,
                filename: `inventory_${new Date().toISOString().split('T')[0]}.pdf`,
                orientation: 'landscape',
                columns: [
                  { header: 'Product', key: 'product_name' },
                  { header: 'Category', key: 'product_category' },
                  { header: 'Current Stock', key: 'current_stock', align: 'center' },
                  { header: 'Min Stock', key: 'min_stock', align: 'center' },
                  { header: 'Unit Price (NGN)', key: 'unit_price', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Stock Value (NGN)', key: 'stock_value', align: 'right', format: (v) => `NGN ${Number(v).toLocaleString()}` },
                  { header: 'Status', key: 'stock_status' },
                ],
                data: stockLevels.map(l => ({
                  product_name: l.products?.name || '-',
                  product_category: l.products?.category || '-',
                  current_stock: l.current_stock,
                  min_stock: l.min_stock,
                  unit_price: Number(l.products?.unit_price || 0),
                  stock_value: l.current_stock * Number(l.products?.unit_price || 0),
                  stock_status: l.current_stock === 0 ? 'Out of Stock' : l.current_stock <= l.min_stock ? 'Low Stock' : 'In Stock',
                })),
                summaryRows: [
                  { label: 'Total Stock Items', value: stockLevels.length.toString() },
                  { label: 'Total Stock Value (NGN)', value: `NGN ${totalValue.toLocaleString()}` },
                  { label: 'Low Stock Items', value: lowStockItems.length.toString() },
                  { label: 'Out of Stock', value: outOfStockItems.length.toString() },
                ],
              });
              toast({ title: 'PDF Downloaded', description: 'Inventory report exported.' });
            }}
          />
          {!isViewer && <Button size="sm" onClick={() => setShowNewDelivery(true)}><Plus className="h-4 w-4 mr-1.5" />Adjust Stock</Button>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${kpi.color} mb-2`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-bold text-xl">{kpi.value}</p>
              <p className="text-xs mt-0.5">
                <span className={`font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.up ? '↑' : ''} {kpi.trend}</span>{' '}
                <span className="text-muted-foreground">{kpi.trendLabel}</span>
              </p>
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
              <Input placeholder="Search products, SKU, or category..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select defaultValue="all_categories">
              <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent><SelectItem value="all_categories">All Categories</SelectItem></SelectContent>
            </Select>
            <Select defaultValue="all_brands">
              <SelectTrigger className="w-full lg:w-32"><SelectValue placeholder="All Brands" /></SelectTrigger>
              <SelectContent><SelectItem value="all_brands">All Brands</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Product Table */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b px-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                >
                  {tab.label}
                  {tab.count > 0 && <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">{tab.count}</Badge>}
                </button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"><input type="checkbox" className="rounded" /></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Stock Value (₦)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(s => {
                  const product = products.find(p => p.id === s.product_id);
                  const pct = s.max_stock > 0 ? Math.round((s.current_stock / s.max_stock) * 100) : 0;
                  const isLow = s.current_stock > 0 && s.current_stock <= s.min_stock;
                  const isOut = s.current_stock === 0;
                  const stockValue = s.current_stock * Number(s.products?.unit_price || 0);
                  return (
                    <TableRow key={s.id}>
                      <TableCell onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                          <span className="font-medium text-sm">{s.products?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product?.sku || '-'}</TableCell>
                      <TableCell className="text-sm">{product?.category || '-'}</TableCell>
                      <TableCell className="text-right text-sm">{s.max_stock.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="text-sm font-medium">{s.current_stock.toLocaleString()}</span>
                          <span className={`text-xs ml-1 ${isLow ? 'text-amber-600' : isOut ? 'text-red-500' : 'text-emerald-600'}`}>({pct}%)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">₦{stockValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${isOut ? 'bg-red-50 text-red-700 border-red-200' : isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedItems.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No products found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t text-sm text-muted-foreground">
              <span>Showing {Math.min(((currentPage - 1) * 8) + 1, totalItems)} to {Math.min(currentPage * 8, totalItems)} of {totalItems} products</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                  <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => goToPage(i + 1)}>{i + 1}</Button>
                ))}
                {totalPages > 3 && <span className="px-1">...</span>}
                {totalPages > 3 && <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goToPage(totalPages)}>{totalPages}</Button>}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inventory Value by Category */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Inventory Value by Category</CardTitle>
              <Select defaultValue="this_month"><SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="this_month">This Month</SelectItem></SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {(categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <text x="50%" y="46%" textAnchor="middle" className="text-base font-bold fill-foreground">{formatCurrency(categoryTotal)}</text>
                    <text x="50%" y="57%" textAnchor="middle" className="text-[10px] fill-muted-foreground">Total Value</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.value)} ({categoryTotal > 0 ? ((cat.value / categoryTotal) * 100).toFixed(1) : 0}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Stock Alerts</CardTitle>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">View All</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockItems.slice(0, 4).map(s => (
                <div key={s.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${s.current_stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.current_stock === 0 ? 'Out of stock' : 'Low stock'}: {s.products?.name}</p>
                    <p className="text-xs text-muted-foreground">Available: {s.current_stock} units</p>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No stock alerts</p>}
            </CardContent>
          </Card>

          {/* Inventory Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Inventory Summary</CardTitle>
              <Select defaultValue="this_month"><SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="this_month">This Month</SelectItem></SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Added to Stock</p>
                  <p className="font-bold text-sm">{deliveries.filter(d => d.status === 'received').length} deliveries</p>
                  <p className="text-xs text-emerald-600">↑ 12.4%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Pending Deliveries</p>
                  <p className="font-bold text-sm">{pendingDeliveries.length}</p>
                  <p className="text-xs text-muted-foreground">awaiting receipt</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Low Stock SKUs</p>
                  <p className="font-bold text-sm">{lowStockItems.length}</p>
                  <p className="text-xs text-amber-600">need reorder</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                  <p className="font-bold text-sm">{outOfStockItems.length}</p>
                  <p className="text-xs text-red-500">urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delivery Detail Dialog */}
      <Dialog open={!!viewDelivery} onOpenChange={o => !o && setViewDelivery(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Delivery Details</DialogTitle></DialogHeader>
          {viewDelivery && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Invoice:</span> {viewDelivery.invoice_number}</div>
                <div><span className="text-muted-foreground">Date:</span> {viewDelivery.date}</div>
                <div><span className="text-muted-foreground">Credit Term:</span> {viewDelivery.credit_term_days} days</div>
                <div><span className="text-muted-foreground">Due:</span> {viewDelivery.due_date}</div>
              </div>
              {viewDelivery.invoice_file_url && (
                <div className="border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-primary" /><span className="font-medium">Invoice Attached</span></div>
                    <Button size="sm" variant="outline" asChild><a href={viewDelivery.invoice_file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" /> View</a></Button>
                  </div>
                  {viewDelivery.invoice_file_url.match(/\.(jpg|jpeg|png|webp)$/i) && (
                    <img src={viewDelivery.invoice_file_url} alt="Invoice" className="mt-2 rounded-md max-h-48 w-full object-contain" />
                  )}
                </div>
              )}
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(viewDelivery.delivery_items || []).map((i) => (
                    <TableRow key={i.id}><TableCell>{i.products?.name}</TableCell><TableCell>{i.quantity}</TableCell><TableCell className="text-right">₦{(i.quantity * Number(i.unit_price)).toLocaleString()}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-right font-bold">Total: ₦{Number(viewDelivery.total_value).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NewDeliveryDialog open={showNewDelivery} onOpenChange={setShowNewDelivery} />
      <InvoiceVerificationDialog open={showVerification} onOpenChange={setShowVerification} result={verificationResult} isLoading={verificationLoading} error={verificationError}
        onConfirm={() => { setShowVerification(false); toast({ title: '✅ Verification Confirmed', description: 'Invoice verification acknowledged.' }); }}
      />
    </div>
  );
}
