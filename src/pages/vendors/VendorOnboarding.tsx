import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { UserPlus, Camera, ArrowLeft } from 'lucide-react';

const territories = ['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin', 'Oshodi', 'Ikorodu', 'Ajah', 'Festac'];
const banks = ['GTBank', 'First Bank', 'UBA', 'Access Bank', 'Zenith Bank', 'Stanbic IBTC', 'Fidelity', 'Wema'];
const eduLevels = ['None', 'Primary', 'Secondary', 'OND', 'HND', 'BSc', 'MSc'];
const uniformSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', dateOfBirth: '', gender: 'male',
    nationalId: '', address: '', territory: 'Ikeja',
    nextOfKin: '', nextOfKinPhone: '',
    bankName: '', bankAccount: '', mobileMoneyNumber: '',
    guarantorName: '', guarantorPhone: '',
    educationLevel: 'Secondary', maritalStatus: 'Single',
    languages: 'English, Yoruba', uniformSize: 'M',
    healthStatus: 'Fit', biometricsEnabled: false, notes: '',
  });

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.nationalId) {
      toast({ title: 'Validation Error', description: 'Name, Phone, and National ID are required.', variant: 'destructive' });
      return;
    }
    toast({ title: '✅ Vendor Registered', description: `${form.name} has been successfully onboarded.` });
    navigate('/vendors');
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/vendors')} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </Button>
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
                {/* Photo Upload */}
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
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={v => update('gender', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Select value={form.maritalStatus} onValueChange={v => update('maritalStatus', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
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
                  <div className="space-y-2"><Label>National ID (NIN) *</Label><Input value={form.nationalId} onChange={e => update('nationalId', e.target.value)} placeholder="NIN-XXXXXXXXXXX" required /></div>
                  <div className="space-y-2">
                    <Label>Biometrics</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch checked={form.biometricsEnabled} onCheckedChange={v => update('biometricsEnabled', v)} />
                      <span className="text-sm text-muted-foreground">{form.biometricsEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Next of Kin</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Next of Kin Name</Label><Input value={form.nextOfKin} onChange={e => update('nextOfKin', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Next of Kin Phone</Label><Input value={form.nextOfKinPhone} onChange={e => update('nextOfKinPhone', e.target.value)} /></div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Guarantor</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Guarantor Name</Label><Input value={form.guarantorName} onChange={e => update('guarantorName', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Guarantor Phone</Label><Input value={form.guarantorPhone} onChange={e => update('guarantorPhone', e.target.value)} /></div>
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
                    <Select value={form.bankName} onValueChange={v => update('bankName', v)}>
                      <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                      <SelectContent>{banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.bankAccount} onChange={e => update('bankAccount', e.target.value)} maxLength={10} /></div>
                  <div className="space-y-2"><Label>Mobile Money Number</Label><Input value={form.mobileMoneyNumber} onChange={e => update('mobileMoneyNumber', e.target.value)} placeholder="+234..." /></div>
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
                    <Label>Education Level</Label>
                    <Select value={form.educationLevel} onValueChange={v => update('educationLevel', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{eduLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Languages Spoken</Label><Input value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Yoruba, Igbo" /></div>
                  <div className="space-y-2">
                    <Label>Uniform Size</Label>
                    <Select value={form.uniformSize} onValueChange={v => update('uniformSize', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{uniformSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Health Status</Label><Input value={form.healthStatus} onChange={e => update('healthStatus', e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Notes / Remarks</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder="Any additional notes..." /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => navigate('/vendors')}>Cancel</Button>
          <Button type="submit">Register Vendor</Button>
        </div>
      </form>
    </div>
  );
}
