import {
  Users, Package, ClipboardList, BarChart3, DollarSign, Award,
  Map, ShoppingCart, Shield, Settings, Home, Truck, CreditCard, History,
  Clock, Warehouse, ScanLine, FileText, Smartphone, Bell, TrendingUp,
  Building2, GraduationCap, Gift, Handshake, Store, UserCog, Grid3X3
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

const navGroups = [
  {
    labelKey: 'overview',
    items: [
      { titleKey: 'dashboard', url: '/', icon: Home },
      { titleKey: 'notifications', url: '/notifications', icon: Bell },
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
    ],
  },
  {
    labelKey: 'system',
    items: [
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              OK
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">OKFARM</p>
              <p className="text-xs text-sidebar-foreground/60">Distributor Manager</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm mx-auto">
            OK
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {navGroups.map(group => {
          if ((group as any).adminOrManager && !isAdmin && !isManager) return null;
          return (
            <SidebarGroup key={group.labelKey}>
              <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(item => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url))}
                      >
                        <NavLink to={item.url} end={item.url === '/'} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{t(item.titleKey)}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-sidebar-foreground">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
