import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Package, Wallet, BarChart2, Gift, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard',   url: '/',                    icon: Home,        exact: true  },
  { label: 'Operations',  url: '/mobile/operations',   icon: Layers,      exact: false },
  { label: 'Inventory',   url: '/mobile/inventory',    icon: Package,     exact: false },
  { label: 'Finance',     url: '/mobile/finance',      icon: Wallet,      exact: false },
  { label: 'Analytics',   url: '/mobile/analytics',    icon: BarChart2,   exact: false },
  { label: 'Programs',    url: '/mobile/programs',     icon: Gift,        exact: false },
  { label: 'Admin',       url: '/mobile/admin',        icon: ShieldCheck, exact: false, adminOnly: true },
];

export function BottomBar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin' || user?.role === 'manager'
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border/80 backdrop-blur-md md:hidden shadow-lg safe-bottom">
      <div
        className="flex items-stretch justify-around"
        style={{ height: '60px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.url
            : location.pathname === item.url || location.pathname.startsWith(item.url + '/');

          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.exact}
              className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-center transition-colors duration-200"
            >
              <div
                className={`flex items-center justify-center rounded-xl transition-all duration-200 mb-0.5 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                style={{ width: 32, height: 28 }}
              >
                <Icon
                  className={`transition-all duration-200 ${isActive ? 'h-[22px] w-[22px]' : 'h-5 w-5'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[9.5px] leading-tight font-medium tracking-tight truncate w-full text-center transition-colors duration-200 ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
