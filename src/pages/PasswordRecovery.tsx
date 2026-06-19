import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight, ArrowLeft, Shield, Lock, ShieldCheck, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function PasswordRecovery() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending reset link
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
    toast({
      title: 'Reset link sent!',
      description: `We've sent password reset instructions to ${email}`,
    });
  };

  const features = [
    {
      icon: Mail,
      title: 'Secure Process',
      description: "We'll send a secure reset link to your email",
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'Reset your password in just a few steps',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      icon: Lock,
      title: 'Account Protection',
      description: 'Keep your account safe and secure',
      color: 'bg-blue-600/20 text-blue-300',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand & Info */}
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
              Can't access<br />
              your <span className="text-blue-400">account?</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-md">
              No worries! Enter your email address and
              we'll send you instructions to reset your
              password.
            </p>
          </div>

          {/* Info Cards */}
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
            <div className="flex items-end gap-2">
              <div className="w-8 h-10 bg-amber-700/40 rounded-sm" />
              <div className="w-6 h-8 bg-amber-700/30 rounded-sm" />
            </div>
            <div className="relative">
              <div className="w-32 h-20 bg-white/10 rounded-md border border-white/10" />
              <div className="absolute -top-10 left-2 w-18 h-14 bg-white/15 rounded-t-lg border border-white/10 border-b-0" />
              <div className="absolute bottom-[-4px] left-3 w-5 h-5 rounded-full bg-white/20" />
              <div className="absolute bottom-[-4px] right-3 w-5 h-5 rounded-full bg-white/20" />
              <img src="/distribo-icon.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 object-contain opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Recovery Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 lg:p-12 relative">
        {/* Back to login */}
        <Link
          to="/login"
          className="absolute top-6 right-6 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="w-full max-w-md">
          {/* Recovery Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-8 lg:p-10 border border-gray-100 dark:border-gray-700">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Reset your password
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Enter the email address associated with your
                Distribo account and we'll send you a link
                to reset your password.
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ Reset link sent to {email}
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-1">
                    Check your inbox and follow the instructions.
                  </p>
                </div>
                <Button
                  onClick={() => { setSent(false); setEmail(''); }}
                  variant="outline"
                  className="w-full h-11 rounded-xl text-sm"
                >
                  Send again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="recovery-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>

            {/* Try Another Way */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-sm font-medium border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              type="button"
            >
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Try another way
            </Button>

            {/* Help text */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Still having trouble?{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                Contact our support team
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Your security is our priority</span>
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
