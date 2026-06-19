import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Clock, ScanLine, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomBar() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { titleKey: 'dashboard', url: '/', icon: Home },
    { titleKey: 'vendors', url: '/vendors', icon: Users },
    { titleKey: 'checkIn', url: '/checkin', icon: Clock },
    { titleKey: 'scanner', url: '/scanner', icon: ScanLine },
    { titleKey: 'settings', url: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 border-t border-border/80 backdrop-blur-md flex items-center justify-around px-2 pb-safe md:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.url ||
          (item.url !== '/' && location.pathname.startsWith(item.url));

        return (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/'}
            className={({ isActive: linkActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors duration-200 ${
                isActive || linkActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary scale-105'
                : 'text-muted-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 max-w-[64px] truncate capitalize">
              {t(item.titleKey)}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
}
