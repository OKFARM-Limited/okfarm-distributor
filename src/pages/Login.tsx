import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, Lock, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Login() {
  const { login, verifyPin, isAuthenticated, isPinVerified } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [biometrics, setBiometrics] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && isPinVerified) {
    navigate('/');
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      if (!success) {
        toast({ title: 'Login Failed', description: 'Invalid email or password. Try admin@okfarm.com / admin123', variant: 'destructive' });
      }
    }, 500);
  };

  const handlePinSubmit = () => {
    const success = verifyPin(pin);
    if (success) {
      navigate('/');
    } else {
      toast({ title: 'Invalid PIN', description: 'Please try again. Hint: 1234 for admin', variant: 'destructive' });
      setPin('');
    }
  };

  if (isAuthenticated && !isPinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl">OK</div>
            <CardTitle className="text-xl">Enter PIN</CardTitle>
            <CardDescription>Verify your identity to continue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button className="w-full" onClick={handlePinSubmit} disabled={pin.length < 4}>
              <Lock className="h-4 w-4 mr-2" /> Verify PIN
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Fingerprint className="h-4 w-4" />
              <span>Biometrics available</span>
              <Switch checked={biometrics} onCheckedChange={setBiometrics} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl">OK</div>
          <CardTitle className="text-xl">OKFARM Distributor Manager</CardTitle>
          <CardDescription>Sign in to manage your operations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="admin@okfarm.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> admin@okfarm.com / admin123</p>
              <p><strong>Assistant:</strong> assistant@okfarm.com / assist123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
