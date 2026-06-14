import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from '@/contexts/OutletContext';
import { useUpsertVendor } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Camera, ArrowLeft, Loader2 } from 'lucide-react';
import { processAndUploadImage } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const territories = ['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'];
const banks = ['GTBank', 'First Bank', 'UBA', 'Access Bank', 'Zenith Bank', 'Stanbic IBTC', 'Fidelity', 'Wema'];
const eduLevels = ['None', 'Primary', 'Secondary', 'OND', 'HND', 'BSc', 'MSc'];
const uniformSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { allOutlets } = useOutletContext();
  const upsertVendor = useUpsertVendor();
  const { viewerProps } = useViewerGuard();
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', date_of_birth: '', gender: 'male',
    national_id: '', address: '', territory: 'Ikeja', outlet_id: allOutlets[0]?.id || '',
    next_of_kin: '', next_of_kin_phone: '',
    bank_name: '', bank_account: '', mobile_money_number: '',
    guarantor_name: '', guarantor_phone: '',
    education_level: 'Secondary', marital_status: 'Single',
    languages: 'English, Yoruba', uniform_size: 'M',
    health_status: 'Fit', biometrics_enabled: false, notes: '',
  });

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: 'Validation Error', description: 'Name and Phone are required.', variant: 'destructive' });
      return;
    }
    try {
      // Generate sequential vendor code via server-side RPC
      const { data: vendor_code, error: codeErr } = await supabase.rpc('generate_vendor_code');
      if (codeErr || !vendor_code) throw new Error(codeErr?.message || 'Failed to generate vendor code');

      // Convert photo to WebP and upload to Supabase Storage
      let photo_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name.replace(' ', '')}`;
      if (photoFile) {
        try {
          photo_url = await processAndUploadImage(photoFile, 'vendor-photos', vendor_code);
        } catch (uploadErr: any) {
          console.warn('Photo upload failed, using fallback avatar:', uploadErr.message);
        }
      }

      await upsertVendor.mutateAsync({
        vendor_code,
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        territory: form.territory,
        outlet_id: form.outlet_id || null,
        biometrics_enabled: form.biometrics_enabled,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender as 'male' | 'female' | 'other',
        national_id: form.national_id || null,
        address: form.address || null,
        next_of_kin: form.next_of_kin || null,
        next_of_kin_phone: form.next_of_kin_phone || null,
        bank_name: form.bank_name || null,
        bank_account: form.bank_account || null,
        guarantor_name: form.guarantor_name || null,
        guarantor_phone: form.guarantor_phone || null,
        mobile_money_number: form.mobile_money_number || null,
        education_level: form.education_level || null,
        marital_status: form.marital_status || null,
        languages: form.languages ? form.languages.split(',').map(l => l.trim()) : null,
        uniform_size: form.uniform_size || null,
        health_status: form.health_status || null,
        notes: form.notes || null,
        photo_url,
      });
      toast({ title: '✅ Vendor Registered', description: `${form.name} has been successfully onboarded.` });
      navigate('/vendors');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/vendors')} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </Button>
      <ViewerBanner />
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Vendor Onboarding</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="work">Work Details</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photoPreview} />
                      <AvatarFallback className="bg-muted"><Camera className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Upload Photo</p>
                    <p>Click the avatar to select a photo</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Phone Number *</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234..." required /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={v => update('gender', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Select value={form.marital_status} onValueChange={v => update('marital_status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Residential Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity">
            <Card>
              <CardHeader><CardTitle className="text-base">Identity & Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>National ID (NIN/BVN)</Label><Input value={form.national_id} onChange={e => update('national_id', e.target.value)} placeholder="NIN-XXXXXXXXXXX (optional)" /></div>
                  <div className="space-y-2">
                    <Label>Biometrics</Label>
                    <div className="flex items-center gap-2 pt-2"><Switch checked={form.biometrics_enabled} onCheckedChange={v => update('biometrics_enabled', v)} /><span className="text-sm text-muted-foreground">{form.biometrics_enabled ? 'Enabled' : 'Disabled'}</span></div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Next of Kin</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Next of Kin Name</Label><Input value={form.next_of_kin} onChange={e => update('next_of_kin', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Next of Kin Phone</Label><Input value={form.next_of_kin_phone} onChange={e => update('next_of_kin_phone', e.target.value)} /></div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Guarantor</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Guarantor Name</Label><Input value={form.guarantor_name} onChange={e => update('guarantor_name', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Guarantor Phone</Label><Input value={form.guarantor_phone} onChange={e => update('guarantor_phone', e.target.value)} /></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader><CardTitle className="text-base">Financial Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Select value={form.bank_name} onValueChange={v => update('bank_name', v)}>
                      <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                      <SelectContent>{banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.bank_account} onChange={e => update('bank_account', e.target.value)} maxLength={10} /></div>
                  <div className="space-y-2"><Label>Mobile Money Number</Label><Input value={form.mobile_money_number} onChange={e => update('mobile_money_number', e.target.value)} placeholder="+234..." /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card>
              <CardHeader><CardTitle className="text-base">Work & Assignment Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Territory</Label>
                    <Select value={form.territory} onValueChange={v => update('territory', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Outlet</Label>
                    <Select value={form.outlet_id} onValueChange={v => update('outlet_id', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{allOutlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Education Level</Label>
                    <Select value={form.education_level} onValueChange={v => update('education_level', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{eduLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Languages Spoken</Label><Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Yoruba, Igbo" /></div>
                  <div className="space-y-2">
                    <Label>Uniform Size</Label>
                    <Select value={form.uniform_size} onValueChange={v => update('uniform_size', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{uniformSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Health Status</Label><Input value={form.health_status} onChange={e => update('health_status', e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Notes / Remarks</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder="Any additional notes..." /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => navigate('/vendors')}>Cancel</Button>
          <Button type="submit" disabled={upsertVendor.isPending} {...viewerProps}>
            {upsertVendor.isPending ? 'Registering...' : 'Register Vendor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
