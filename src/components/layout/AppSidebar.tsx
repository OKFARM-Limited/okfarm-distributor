import {
  Users, Package, ClipboardList, BarChart3, DollarSign, Award,
  Map, ShoppingCart, Shield, Settings, Home, Truck, CreditCard, History,
  Clock, Warehouse, ScanLine, FileText, Smartphone, Bell, TrendingUp,
  Building2, GraduationCap, Gift, Handshake, Store, UserCog, Grid3X3, RefreshCw, Upload, User as UserIcon, BellRing,
  ChevronDown
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { LucideIcon } from 'lucide-react';

interface NavGroup {
  labelKey: string;
  adminOrManager?: boolean;
  items: { titleKey: string; url: string; icon: LucideIcon }[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: 'overview',
    items: [
      { titleKey: 'dashboard', url: '/', icon: Home },
      { titleKey: 'notifications', url: '/notifications', icon: Bell },
      { titleKey: 'My Portal', url: '/my-portal', icon: UserIcon },
    ],
  },
  {
    labelKey: 'operations',
    items: [
      { titleKey: 'vendors', url: '/vendors', icon: Users },
      { titleKey: 'checkIn', url: '/checkin', icon: Clock },
      { titleKey: 'assets', url: '/assets', icon: Package },
      { titleKey: 'allocation', url: '/allocation', icon: ClipboardList },
      { titleKey: 'reconciliation', url: '/reconciliation', icon: History },
      { titleKey: 'allocationHistory', url: '/allocation/history', icon: ClipboardList },
    ],
  },
  {
    labelKey: 'inventory',
    items: [
      { titleKey: 'inboundStock', url: '/inventory', icon: Warehouse },
      { titleKey: 'scanner', url: '/scanner', icon: ScanLine },
    ],
  },
  {
    labelKey: 'finance',
    items: [
      { titleKey: 'salesEntry', url: '/sales', icon: DollarSign },
      { titleKey: 'payments', url: '/payments', icon: CreditCard },
      { titleKey: 'mobileMoney', url: '/mobile-money', icon: Smartphone },
      { titleKey: 'duesStatement', url: '/dues', icon: FileText },
    ],
  },
  {
    labelKey: 'analytics',
    items: [
      { titleKey: 'performance', url: '/performance', icon: BarChart3 },
      { titleKey: 'vendorMap', url: '/map', icon: Map },
    ],
  },
  {
    labelKey: 'programs',
    items: [
      { titleKey: 'incentives', url: '/incentives', icon: Gift },
      { titleKey: 'fanAcademy', url: '/training', icon: GraduationCap },
    ],
  },
  {
    labelKey: 'admin',
    adminOrManager: true,
    items: [
      { titleKey: 'outlets', url: '/outlets', icon: Store },
      { titleKey: 'products', url: '/products', icon: Package },
      { titleKey: 'commissions', url: '/commissions', icon: Award },
      { titleKey: 'payouts', url: '/payouts', icon: Truck },
      { titleKey: 'orders', url: '/orders', icon: ShoppingCart },
      { titleKey: 'forecast', url: '/forecast', icon: TrendingUp },
      { titleKey: 'settlement', url: '/settlement', icon: Handshake },
      { titleKey: 'depots', url: '/depots', icon: Building2 },
      { titleKey: 'auditTrail', url: '/audit', icon: Shield },
      { titleKey: 'userRoles', url: '/roles', icon: UserCog },
      { titleKey: 'permissions', url: '/permissions', icon: Grid3X3 },
      { titleKey: 'stockRecalc', url: '/stock-recalc', icon: RefreshCw },
      { titleKey: 'Bulk Import', url: '/bulk-import', icon: Upload },
    ],
  },
  {
    labelKey: 'system',
    items: [
      { titleKey: 'Notification Preferences', url: '/settings/notifications', icon: BellRing },
      { titleKey: 'settings', url: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-base shadow-lg shadow-blue-500/20">
              D
            </div>
            <div>
              <p className="text-base font-bold text-sidebar-foreground tracking-tight">Distribo</p>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-base mx-auto shadow-lg shadow-blue-500/20">
            D
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {navGroups.map(group => {
          if (group.adminOrManager && !isAdmin && !isManager) return null;
          return (
            <SidebarGroup key={group.labelKey}>
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] font-semibold tracking-wider">{t(group.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(item => {
                    const isActive = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                        >
                          <NavLink
                            to={item.url}
                            end={item.url === '/'}
                            className={`transition-all duration-200 rounded-lg ${
                              isActive
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md shadow-sidebar-primary/20'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                            }`}
                            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          >
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{t(item.titleKey)}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user && (
          <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8 bg-sidebar-primary text-sidebar-primary-foreground">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-sidebar-foreground">{user.name}</p>
                  <p className="text-[10px] text-sidebar-foreground/60 capitalize">{user.role === 'admin' ? 'Super Admin' : user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
              </>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
