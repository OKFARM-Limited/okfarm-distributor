import { useState, useRef } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useInboundDeliveries, useUpdateDelivery, useStockLevels } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Truck, Package, AlertTriangle, Eye, CheckCircle, Loader2, Upload, FileText, ExternalLink, Plus } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import NewDeliveryDialog from '@/components/inventory/NewDeliveryDialog';
import InvoiceVerificationDialog from '@/components/inventory/InvoiceVerificationDialog';

export default function InventoryInbound() {
  const [viewDelivery, setViewDelivery] = useState<any>(null);
  const [showNewDelivery, setShowNewDelivery] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const { selectedOutletId, isAllOutlets } = useOutletContext();
  const { data: deliveries = [], isLoading: dLoading } = useInboundDeliveries(isAllOutlets ? 'all' : selectedOutletId);
  const { data: stockLevels = [], isLoading: sLoading } = useStockLevels(isAllOutlets ? 'all' : selectedOutletId);
  const updateDelivery = useUpdateDelivery();
  const { viewerProps, isViewer } = useViewerGuard();

  const totalStock = (stockLevels as any[]).reduce((s, l) => s + l.current_stock, 0);
  const lowStockItems = (stockLevels as any[]).filter(s => s.current_stock <= s.min_stock);
  const pendingDeliveries = (deliveries as any[]).filter(d => d.status === 'pending');

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

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: 'File too large', description: 'Maximum file size is 10MB.', variant: 'destructive' });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF or image file.', variant: 'destructive' });
      return;
    }

    setUploading(uploadTargetId);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${uploadTargetId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      await updateDelivery.mutateAsync({
        id: uploadTargetId,
        invoice_file_url: urlData.publicUrl,
      });

      toast({ title: '✅ Invoice Uploaded', description: 'Invoice file has been attached. Verifying...' });

      // Trigger AI verification
      const delivery = (deliveries as any[]).find(d => d.id === uploadTargetId);
      if (delivery) {
        runVerification(urlData.publicUrl, delivery);
      }
    } catch (err: unknown) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
      setUploadTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runVerification = async (invoiceUrl: string, delivery: Record<string, unknown>) => {
    setVerificationResult(null);
    setVerificationError(null);
    setVerificationLoading(true);
    setShowVerification(true);

    try {
      const deliveryData = {
        invoice_number: delivery.invoice_number,
        supplier: delivery.supplier,
        total_value: Number(delivery.total_value),
        items: (delivery.delivery_items || []).map((i) => ({
          product_name: i.products?.name || 'Unknown',
          quantity: i.quantity,
          unit_price: Number(i.unit_price),
        })),
      };

      const { data, error } = await supabase.functions.invoke('verify-invoice', {
        body: { invoiceImageUrl: invoiceUrl, deliveryData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setVerificationResult(data);
    } catch (err: unknown) {
      setVerificationError(err.message || 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  if (dLoading || sLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Inventory Inbound</h1>
        {!isViewer && (
          <Button onClick={() => setShowNewDelivery(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Delivery
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{totalStock}</p><p className="text-xs text-muted-foreground">Total Units in Stock</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Truck className="h-5 w-5 mx-auto text-secondary mb-1" /><p className="text-2xl font-bold">{pendingDeliveries.length}</p><p className="text-xs text-muted-foreground">Pending Deliveries</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{lowStockItems.length}</p><p className="text-xs text-muted-foreground">Low Stock SKUs</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" /><p className="text-2xl font-bold">{(deliveries as any[]).filter(d => d.status === 'verified' || d.status === 'received').length}</p><p className="text-xs text-muted-foreground">Received</p></CardContent></Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList><TabsTrigger value="stock">Stock Levels</TabsTrigger><TabsTrigger value="deliveries">Deliveries</TabsTrigger></TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader><CardTitle className="text-base">Net Stock Position</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(stockLevels as any[]).length === 0 && <p className="text-center text-muted-foreground py-8">No stock data yet. Stock levels will appear here once populated.</p>}
              {(stockLevels as any[]).map((s) => {
                const pct = Math.min((s.current_stock / s.max_stock) * 100, 100);
                const isLow = s.current_stock <= s.min_stock;
                return (
                  <div key={s.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isLow ? 'text-destructive font-medium' : ''}>{s.products?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">{s.current_stock} / {s.max_stock} {isLow && '⚠️'}</span>
                    </div>
                    <Progress value={pct} className={isLow ? '[&>div]:bg-destructive' : ''} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Invoice</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {(deliveries as any[]).map(d => (
                    <TableRow key={d.id}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {d.invoice_file_url && <FileText className="h-3 w-3 text-primary" />}
                          {d.invoice_number}
                        </div>
                      </TableCell>
                      <TableCell>{d.supplier}</TableCell>
                      <TableCell>{d.delivery_items?.length || 0} SKUs</TableCell>
                      <TableCell>₦{Number(d.total_value).toLocaleString()}</TableCell>
                      <TableCell>{d.due_date}</TableCell>
                      <TableCell><Badge variant={d.status === 'received' ? 'default' : d.status === 'verified' ? 'secondary' : 'outline'}>{d.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        {!isViewer && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => triggerUpload(d.id)}
                            disabled={uploading === d.id}
                            title={d.invoice_file_url ? 'Replace invoice' : 'Upload invoice'}
                          >
                            {uploading === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setViewDelivery(d)}><Eye className="h-3 w-3" /></Button>
                        {d.status === 'pending' && <Button size="sm" onClick={() => markReceived(d.id)} {...viewerProps}>Receive</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(deliveries as any[]).length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No deliveries recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">Invoice Attached</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={viewDelivery.invoice_file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> View
                      </a>
                    </Button>
                  </div>
                  {viewDelivery.invoice_file_url.match(/\.(jpg|jpeg|png|webp)$/i) && (
                    <img
                      src={viewDelivery.invoice_file_url}
                      alt="Invoice"
                      className="mt-2 rounded-md max-h-48 w-full object-contain"
                    />
                  )}
                </div>
              )}

              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(viewDelivery.delivery_items || []).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.products?.name}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell className="text-right">₦{(i.quantity * Number(i.unit_price)).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-right font-bold">Total: ₦{Number(viewDelivery.total_value).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NewDeliveryDialog open={showNewDelivery} onOpenChange={setShowNewDelivery} />

      <InvoiceVerificationDialog
        open={showVerification}
        onOpenChange={setShowVerification}
        result={verificationResult}
        isLoading={verificationLoading}
        error={verificationError}
        onConfirm={() => {
          setShowVerification(false);
          toast({ title: '✅ Verification Confirmed', description: 'Invoice verification acknowledged.' });
        }}
      />
    </div>
  );
}
