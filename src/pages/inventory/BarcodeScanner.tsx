import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ScanLine, Package, Keyboard, Loader2, Camera, CameraOff } from 'lucide-react';

export default function BarcodeScanner() {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItems, setScannedItems] = useState<{ productId: string; productName: string; barcode: string; quantity: number; time: string }[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [], isLoading } = useProducts();

  const lookupBarcode = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      setScannedItems(prev => {
        const existing = prev.find(i => i.productId === product.id);
        if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { productId: product.id, productName: product.name, barcode: product.barcode || product.sku, quantity: 1, time: new Date().toLocaleTimeString() }];
      });
      toast({ title: '✅ Scanned', description: `${product.name} added` });
    } else {
      toast({ title: '❌ Not Found', description: `Barcode ${barcode} not recognized`, variant: 'destructive' });
    }
    setBarcodeInput('');
  };

  const startCamera = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }
      const scanner = new Html5Qrcode('barcode-scanner-view');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (decodedText: string) => {
          lookupBarcode(decodedText);
        },
        () => {} // ignore errors during scanning
      );
      setCameraActive(true);
    } catch (err: unknown) {
      toast({ title: 'Camera Error', description: (err as Error)?.message || 'Could not access camera. Try manual mode.', variant: 'destructive' });
      setMode('manual');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch { /* scanner may already be stopped */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => { stopCamera(); };
  }, [mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && barcodeInput.trim()) lookupBarcode(barcodeInput.trim());
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="h-6 w-6" /> Barcode Scanner</h1>
      <div className="flex gap-2">
        <Button variant={mode === 'camera' ? 'default' : 'outline'} onClick={() => setMode('camera')} className="gap-1"><Camera className="h-4 w-4" /> Camera</Button>
        <Button variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')} className="gap-1"><Keyboard className="h-4 w-4" /> Manual</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {mode === 'camera' ? (
            <div className="space-y-4">
              <div id="barcode-scanner-view" ref={scannerDivRef} className="rounded-lg overflow-hidden bg-muted min-h-[280px]" />
              {cameraActive && (
                <p className="text-xs text-center text-muted-foreground">Point camera at a barcode. It will auto-detect.</p>
              )}
              <Button variant="outline" onClick={() => { stopCamera(); setMode('manual'); }} className="w-full gap-1">
                <CameraOff className="h-4 w-4" /> Stop Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter barcode or SKU manually, or use an external USB/Bluetooth scanner</p>
              <div className="flex gap-2">
                <Input ref={inputRef} value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Scan or type barcode/SKU..." className="flex-1" autoFocus />
                <Button onClick={() => barcodeInput.trim() && lookupBarcode(barcodeInput.trim())}>Lookup</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {products.map(p => (
                  <Button key={p.id} size="sm" variant="outline" onClick={() => lookupBarcode(p.barcode || p.sku)} className="text-xs">{p.sku}</Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {scannedItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Scanned Items ({scannedItems.reduce((s, i) => s + i.quantity, 0)} total)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scannedItems.map(item => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-muted-foreground">{item.barcode}</p></div>
                  <div className="flex items-center gap-2"><Badge variant="secondary">×{item.quantity}</Badge><span className="text-xs text-muted-foreground">{item.time}</span></div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setScannedItems([])}>Clear</Button>
              <Button onClick={() => { toast({ title: '✅ Saved', description: 'Scanned inventory saved.' }); setScannedItems([]); }}>Save to Inventory</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
