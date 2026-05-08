import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Prefs {
  channel_in_app: boolean;
  channel_email: boolean;
  channel_push: boolean;
  cat_stock: boolean;
  cat_payment: boolean;
  cat_sales: boolean;
  cat_system: boolean;
  daily_digest: boolean;
  email_address: string | null;
}

const DEFAULTS: Prefs = {
  channel_in_app: true,
  channel_email: true,
  channel_push: true,
  cat_stock: true,
  cat_payment: true,
  cat_sales: true,
  cat_system: true,
  daily_digest: false,
  email_address: null,
};

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setPrefs({ ...DEFAULTS, ...data, email_address: data.email_address || user.email });
      else setPrefs({ ...DEFAULTS, email_address: user.email });
      setLoading(false);
    })();
  }, [user?.id, user?.email]);

  const update = (k: keyof Prefs, v: any) => setPrefs(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...prefs }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Preferences saved' });
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const Row = ({ label, k, icon: Icon, desc }: { label: string; k: keyof Prefs; icon?: any; desc?: string }) => (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label className="flex items-center gap-2">{Icon && <Icon className="h-4 w-4" />} {label}</Label>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={!!prefs[k]} onCheckedChange={v => update(k, v)} />
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground">Control which alerts you receive and how.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channels</CardTitle>
          <CardDescription>Where alerts are delivered.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="In-app" k="channel_in_app" icon={Bell} desc="Notification center inside the app." />
          <Row label="Email" k="channel_email" icon={Mail} desc="Send important alerts to your email." />
          <Row label="Push" k="channel_push" icon={Smartphone} desc="Browser/PWA push notifications." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
          <CardDescription>Mute categories you don't need.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="Stock alerts" k="cat_stock" desc="Low stock and variance alerts." />
          <Row label="Payments & overdues" k="cat_payment" />
          <Row label="Sales activity" k="cat_sales" />
          <Row label="System" k="cat_system" desc="Account and platform updates." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Digest</CardTitle>
          <CardDescription>Receive a once-a-day summary email of yesterday's activity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Email me a daily digest" k="daily_digest" icon={Mail} />
          <div className="space-y-1.5">
            <Label>Email address for digest & alerts</Label>
            <Input
              type="email"
              value={prefs.email_address || ''}
              onChange={e => update('email_address', e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
