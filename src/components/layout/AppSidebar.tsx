import {
  Users, Package, ClipboardList, BarChart3, DollarSign, Award,
  Map, ShoppingCart, Shield, Settings, Home, Truck, CreditCard, History,
  Clock, Warehouse, ScanLine, FileText, Smartphone, Bell, TrendingUp,
  Building2, GraduationCap, Gift, Handshake, Store, UserCog
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/', icon: Home },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Vendors', url: '/vendors', icon: Users },
      { title: 'Check-In', url: '/checkin', icon: Clock },
      { title: 'Assets', url: '/assets', icon: Package },
      { title: 'Allocation', url: '/allocation', icon: ClipboardList },
      { title: 'Reconciliation', url: '/reconciliation', icon: History },
      { title: 'Allocation History', url: '/allocation/history', icon: ClipboardList },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { title: 'Inbound Stock', url: '/inventory', icon: Warehouse },
      { title: 'Scanner', url: '/scanner', icon: ScanLine },
    ],
  },
  {
    label: 'Finance',
    items: [
      { title: 'Sales Entry', url: '/sales', icon: DollarSign },
      { title: 'Payments', url: '/payments', icon: CreditCard },
      { title: 'Mobile Money', url: '/mobile-money', icon: Smartphone },
      { title: 'Dues Statement', url: '/dues', icon: FileText },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { title: 'Performance', url: '/performance', icon: BarChart3 },
      { title: 'Vendor Map', url: '/map', icon: Map },
    ],
  },
  {
    label: 'Programs',
    items: [
      { title: 'Incentives', url: '/incentives', icon: Gift },
      { title: 'Fan Academy', url: '/training', icon: GraduationCap },
    ],
  },
  {
    label: 'Admin',
    adminOrManager: true,
    items: [
      { title: 'Outlets', url: '/outlets', icon: Store },
      { title: 'Products', url: '/products', icon: Package },
      { title: 'Commissions', url: '/commissions', icon: Award },
      { title: 'Payouts', url: '/payouts', icon: Truck },
      { title: 'Orders', url: '/orders', icon: ShoppingCart },
      { title: 'Forecast', url: '/forecast', icon: TrendingUp },
      { title: 'Settlement', url: '/settlement', icon: Handshake },
      { title: 'Depots', url: '/depots', icon: Building2 },
      { title: 'Audit Trail', url: '/audit', icon: Shield },
      { title: 'User Roles', url: '/roles', icon: UserCog },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();
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
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
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
                          {!collapsed && <span>{item.title}</span>}
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
