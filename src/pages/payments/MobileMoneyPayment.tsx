import { useState } from 'react';
import { vendors, mobileMoneyProviders, salesRecords } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Smartphone, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

type PaymentStep = 'select' | 'details' | 'confirm' | 'processing' | 'success';

export default function MobileMoneyPayment() {
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reference, setReference] = useState('');

  const vendor = vendors.find(v => v.id === selectedVendor);
  const vendorOutstanding = salesRecords.filter(s => s.vendorId === selectedVendor).reduce((s, r) => s + r.outstanding, 0);
  const selectedProvider = mobileMoneyProviders.find(p => p.id === provider);

  const handleProceed = () => {
    if (!selectedVendor || !provider || !amount || !phoneNumber) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setReference(`TXN-${Date.now().toString(36).toUpperCase()}`);
      setStep('success');
      toast({ title: '✅ Payment Successful', description: `₦${Number(amount).toLocaleString()} collected via ${selectedProvider?.name}` });
    }, 2500);
  };

  const resetForm = () => {
    setStep('select');
    setSelectedVendor('');
    setProvider('');
    setAmount('');
    setPhoneNumber('');
    setReference('');
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6" /> Mobile Money Collection</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {['Select Vendor', 'Payment Details', 'Confirm', 'Done'].map((label, i) => {
          const stepNames: PaymentStep[] = ['select', 'details', 'confirm', 'success'];
          const currentIdx = stepNames.indexOf(step === 'processing' ? 'confirm' : step);
          return (
            <div key={label} className="flex items-center gap-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${i <= currentIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={i <= currentIdx ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
              {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Select Vendor */}
      {step === 'select' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Select Vendor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedVendor} onValueChange={v => { setSelectedVendor(v); setPhoneNumber(vendors.find(vd => vd.id === v)?.mobileMoneyNumber || ''); }}>
              <SelectTrigger><SelectValue placeholder="Choose vendor..." /></SelectTrigger>
              <SelectContent>{vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.id})</SelectItem>)}</SelectContent>
            </Select>
            {vendor && (
              <div className="rounded-lg border p-3 space-y-1">
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-muted-foreground">{vendor.territory} • {vendor.phone}</p>
                <p className="text-sm">Outstanding: <span className="text-destructive font-medium">₦{vendorOutstanding.toLocaleString()}</span></p>
              </div>
            )}
            <Button className="w-full" disabled={!selectedVendor} onClick={() => setStep('details')}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Details */}
      {step === 'details' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Money Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                {mobileMoneyProviders.map(p => (
                  <button key={p.id} type="button" onClick={() => setProvider(p.id)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${provider === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <span className="text-xl">{p.logo}</span>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Phone Number</Label><Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+234..." /></div>
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              {vendorOutstanding > 0 && (
                <Button size="sm" variant="link" className="p-0 h-auto text-xs" onClick={() => setAmount(String(vendorOutstanding))}>
                  Use outstanding: ₦{vendorOutstanding.toLocaleString()}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
              <Button className="flex-1" onClick={handleProceed}>Proceed</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirm Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendor:</span><span className="font-medium">{vendor?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Provider:</span><span className="font-medium">{selectedProvider?.logo} {selectedProvider?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span className="font-medium">{phoneNumber}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2"><span className="text-muted-foreground">Amount:</span><span className="text-lg font-bold">₦{Number(amount).toLocaleString()}</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
              <Button className="flex-1" onClick={handleConfirm}>Confirm & Pay</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3.5: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="font-medium">Processing Payment...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we confirm with {selectedProvider?.name}</p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-success" />
            <div>
              <p className="text-xl font-bold">Payment Successful!</p>
              <p className="text-muted-foreground mt-1">₦{Number(amount).toLocaleString()} collected from {vendor?.name}</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Reference:</span><Badge variant="outline">{reference}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Provider:</span><span>{selectedProvider?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span>{new Date().toLocaleTimeString()}</span></div>
            </div>
            <Button className="w-full" onClick={resetForm}>New Payment</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
