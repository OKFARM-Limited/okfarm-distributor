import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link2, Link2Off, Loader2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Props { vendorId: string; vendorName: string; authUserId: string | null; vendorEmail: string | null; }

export function VendorAuthLink({ vendorId, vendorName, authUserId, vendorEmail }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'link' | 'create'>('link');
  const [email, setEmail] = useState(vendorEmail || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: linkedProfile } = useQuery({
    queryKey: ['vendor-linked-profile', authUserId],
    enabled: !!authUserId,
    queryFn: async () => {
      const { data } = await supabase.from('profiles')
        .select('email, display_name').eq('user_id', authUserId!).maybeSingle();
      return data;
    },
  });

  if (user?.role !== 'admin') return null;

  const call = async (body: any) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('admin-link-vendor', { body });
    setBusy(false);
    if (error || data?.error) {
      toast({ title: 'Error', description: data?.error || error?.message, variant: 'destructive' });
      return false;
    }
    qc.invalidateQueries({ queryKey: ['vendor', vendorId] });
    qc.invalidateQueries({ queryKey: ['vendor-linked-profile'] });
    setOpen(false);
    setPassword('');
    return true;
  };

  const handleLink = () => call({ action: 'link', vendor_id: vendorId, email }).then(ok => {
    if (ok) toast({ title: 'Linked', description: `${vendorName} linked to ${email}` });
  });
  const handleCreate = () => call({ action: 'create_and_link', vendor_id: vendorId, email, password }).then(ok => {
    if (ok) toast({ title: 'Account created', description: `Vendor can log in with ${email}` });
  });
  const handleUnlink = async () => {
    if (!confirm(`Unlink ${vendorName} from their portal account?`)) return;
    const ok = await call({ action: 'unlink', vendor_id: vendorId });
    if (ok) toast({ title: 'Unlinked' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4" /> Vendor Portal Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {authUserId ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default">Linked</Badge>
              <span className="text-sm">{linkedProfile?.email || linkedProfile?.display_name || authUserId.slice(0, 8) + '…'}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This vendor can sign in at <code>/login</code> and view their own sales, commissions and check-ins at <code>/my-portal</code>.
            </p>
            <Button variant="destructive" size="sm" onClick={handleUnlink} disabled={busy}>
              <Link2Off className="h-4 w-4 mr-1" /> Unlink
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              No portal account linked. Link an existing user or create a new vendor account.
            </p>
            <Button size="sm" onClick={() => setOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1" /> Link / Create Account
            </Button>
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Vendor to Portal Account</DialogTitle>
            <DialogDescription>Connect {vendorName} to a login account so they can access the vendor portal.</DialogDescription>
          </DialogHeader>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="link">Link Existing User</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input type="email" placeholder="vendor@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">User must already exist. They'll then see vendor data.</p>
            </TabsContent>
            <TabsContent value="create" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="vendor@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="text" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground">Share with vendor and ask them to change it on first login.</p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            {tab === 'link' ? (
              <Button onClick={handleLink} disabled={busy || !email}>
                {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Link
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={busy || !email || password.length < 6}>
                {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create & Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
