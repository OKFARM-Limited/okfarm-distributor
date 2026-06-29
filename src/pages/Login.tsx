import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Mail, ArrowRight, Shield, Eye, EyeOff, Users, BarChart3, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getRememberMe, supabase } from '@/integrations/supabase/client';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => getRememberMe());

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save remember-me preference before signing in so dynamicStorage uses the right backend
    const { setRememberMe } = await import('@/integrations/supabase/client');
    setRememberMe(rememberMe);

    // Trim email and password to avoid invisible trailing spaces from mobile copy/pasting
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (signInError) {
      setLoading(false);
      toast({ title: t('loginFailed'), description: t('loginFailed'), variant: 'destructive' });
      return;
    }

    // Check if activation has expired (must_change_password is still true + expiry passed)
    const metadata = signInData?.user?.user_metadata;
    if (
      metadata?.must_change_password === true &&
      metadata?.activation_expires_at &&
      new Date(metadata.activation_expires_at).getTime() < Date.now()
    ) {
      // Sign out immediately — activation window has closed
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: 'Activation Expired',
        description:
          'Your 48-hour activation window has expired. Please contact your administrator to resend the activation email.',
        variant: 'destructive',
        duration: 8000,
      });
      return;
    }

    // If credentials are valid and activation is not expired,
    // the AuthContext's onAuthStateChange listener will automatically 
    // pick up the SIGNED_IN event, set the user state, and redirect.
    setLoading(false);
  };

  const features = [
    {
      icon: Users,
      title: 'Vendor Management',
      description: 'Onboard, monitor and empower your vendors',
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      icon: TrendingUp,
      title: 'Sales & Inventory',
      description: 'Track sales, allocations and stock in real-time',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      icon: CreditCard,
      title: 'Payments & Commissions',
      description: 'Reconcile payments and manage payouts',
      color: 'bg-amber-500/20 text-amber-400',
    },
    {
      icon: BarChart3,
      title: 'Insights & Reports',
      description: 'Make data-driven decisions for growth',
      color: 'bg-red-500/20 text-red-400',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand & Features */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative overflow-hidden flex-col justify-between"
        style={{ background: 'linear-gradient(135deg, hsl(215, 60%, 12%) 0%, hsl(215, 55%, 18%) 50%, hsl(215, 60%, 12%) 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[10%] right-[-5%] w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute top-[35%] right-[5%] w-40 h-40 rounded-full bg-white/[0.02] pointer-events-none" />

        {/* Dotted pattern */}
        <div className="absolute top-8 right-8 grid grid-cols-4 gap-2 opacity-30">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" />
          ))}
        </div>

        <div className="relative z-10 p-10 xl:p-14 flex-1 flex flex-col">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex flex-col gap-2">
              <img src="/Distribo-Transparent.png" alt="Distribo" className="h-10 w-auto object-contain self-start" />
              <p className="text-[10px] text-blue-400/80 tracking-widest uppercase font-medium">Distribution · Operations · Growth</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Manage your distribution<br />
              business <span className="text-blue-400">with ease</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-md">
              All-in-one platform to manage vendors, sales,
              inventory, payments, and performance
              across your network.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3 mb-auto">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 group">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-white/50 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom illustration area */}
        <div className="relative h-44 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-4 px-10 opacity-90">
            {/* Truck silhouette using CSS */}
            <div className="flex items-end gap-2">
              <div className="w-8 h-10 bg-amber-700/40 rounded-sm" />
              <div className="w-6 h-8 bg-amber-700/30 rounded-sm" />
              <div className="w-10 h-12 bg-amber-700/40 rounded-sm" />
            </div>
            <div className="relative">
              <div className="w-28 h-16 bg-white/10 rounded-md border border-white/10" />
              <div className="absolute -top-8 left-2 w-16 h-12 bg-white/15 rounded-t-lg border border-white/10 border-b-0" />
              <div className="absolute bottom-[-4px] left-2 w-5 h-5 rounded-full bg-white/20" />
              <div className="absolute bottom-[-4px] right-2 w-5 h-5 rounded-full bg-white/20" />
              {/* Logo on truck */}
              <img src="/distribo-icon.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 object-contain opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-8 lg:p-10 border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome back 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Sign in to your Distribo account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Link
                    to="/password-recovery"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>

            {/* SSO Button */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-sm font-medium border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              type="button"
            >
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Sign in with SSO
            </Button>

            {/* Help text */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                Contact your administrator
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure</span>
              <span>•</span>
              <span>Reliable</span>
              <span>•</span>
              <span>Built for Distributors</span>
            </div>
            <p className="text-xs text-gray-400">
              © 2026 Distribo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
