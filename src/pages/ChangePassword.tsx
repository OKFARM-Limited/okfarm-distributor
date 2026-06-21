import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff, Lock, ShieldAlert, ArrowRight, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Your password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
      data: { must_change_password: false }
    });
    setLoading(false);

    if (error) {
      toast({
        title: 'Error updating password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(215, 60%, 12%) 0%, hsl(215, 55%, 18%) 50%, hsl(215, 60%, 12%) 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[10%] right-[-5%] w-96 h-96 rounded-full bg-white/[0.02] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-96 h-96 rounded-full bg-white/[0.02] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <img src="/Distribo-Transparent.png" alt="Distribo" className="h-10 w-auto object-contain" />
          <p className="text-[10px] text-blue-400/80 tracking-widest uppercase font-medium">Distribution · Operations · Growth</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/10 p-8 lg:p-10 border border-white/5 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Reset Your Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your administrator requires you to set a new password on your first login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password-new" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password-new"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password-confirm" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 text-amber-500 border border-amber-500/10 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Ensure your password is secure and not easily guessed. Once updated, you will be redirected to your dashboard.</span>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Save & Continue'}
              {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-blue-300/60">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure Password Encryption</span>
            <span>•</span>
            <span>OKFARM Platform</span>
          </div>
          <p className="text-xs text-blue-300/40">
            © 2026 Distribo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
