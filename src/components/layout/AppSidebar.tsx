import {
  Users, Package, ClipboardList, BarChart3, Award,
  Map, ShoppingCart, Shield, Settings, Home, Truck, CreditCard, History,
  Clock, Warehouse, ScanLine, FileText, Smartphone, Bell, TrendingUp,
  Building2, GraduationCap, Gift, Handshake, Store, UserCog, Grid3X3, RefreshCw, Upload, User as UserIcon, BellRing,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { NairaIcon } from '@/components/NairaIcon';

interface NavItem {
  titleKey: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}

interface NavGroup {
  labelKey: string;
  adminOrManager?: boolean;
  items: NavItem[];
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
      { titleKey: 'salesEntry', url: '/sales', icon: NairaIcon },
      { titleKey: 'payments', url: '/payments', icon: CreditCard },
      { titleKey: 'mobileMoney', url: '/mobile-money', icon: Smartphone, comingSoon: true },
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
          <div className="flex items-center gap-2.5 h-9">
            <img src="/Distribo-Transparent.png" alt="Distribo" className="h-8 w-auto object-contain" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-9 w-9 mx-auto">
            <img src="/distribo-icon.png" alt="D" className="h-7 w-7 object-contain" />
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
                    if (item.comingSoon) {
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-50 cursor-not-allowed select-none">
                              <item.icon className="h-4 w-4 shrink-0" />
                              {!collapsed && (
                                <span className="flex-1 flex items-center justify-between">
                                  <span>{t(item.titleKey)}</span>
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 border-amber-400 text-amber-600">Soon</Badge>
                                </span>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
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
