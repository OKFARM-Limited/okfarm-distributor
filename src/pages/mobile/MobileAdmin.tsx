import {
  Store, Package, Award, Wallet, ShoppingCart, TrendingUp,
  Handshake, Building2, Shield, UserCog, Grid3X3, RefreshCw, Upload
} from 'lucide-react';
import { MobileMenuItem } from '@/components/mobile/MobileMenuItem';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function MobileAdmin() {
  const { user } = useAuth();

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  const items = [
    {
      icon: Store,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Outlets',
      description: 'Manage outlets and their information',
      to: '/outlets',
    },
    {
      icon: Package,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Products',
      description: 'Manage products and product categories',
      to: '/products',
    },
    {
      icon: Award,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Commissions',
      description: 'Configure commissions and structures',
      to: '/commissions',
    },
    {
      icon: Wallet,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Payouts',
      description: 'Manage payouts to vendors and agents',
      to: '/payouts',
    },
    {
      icon: ShoppingCart,
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      title: 'Orders',
      description: 'View and manage orders',
      to: '/orders',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Forecast',
      description: 'View demand forecast and projections',
      to: '/forecast',
    },
    {
      icon: Handshake,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Settlement',
      description: 'Manage settlements and closing',
      to: '/settlement',
    },
    {
      icon: Building2,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Depots',
      description: 'Manage depots and warehouses',
      to: '/depots',
    },
    {
      icon: Shield,
      iconBg: 'bg-slate-100 dark:bg-slate-900/30',
      iconColor: 'text-slate-600 dark:text-slate-400',
      title: 'Audit Trail',
      description: 'View system audit logs and activities',
      to: '/audit',
    },
    {
      icon: UserCog,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'User Roles',
      description: 'Manage user roles and access levels',
      to: '/roles',
    },
    {
      icon: Grid3X3,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Permissions',
      description: 'Configure permissions and access rights',
      to: '/permissions',
    },
    {
      icon: RefreshCw,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'stockRecalc',
      description: 'Recalculate stock balances and adjustments',
      to: '/stock-recalc',
    },
    {
      icon: Upload,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-500 dark:text-blue-400',
      title: 'Bulk Import',
      description: 'Import data in bulk via files',
      to: '/bulk-import',
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="pb-2">
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage system settings and configurations</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <MobileMenuItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
