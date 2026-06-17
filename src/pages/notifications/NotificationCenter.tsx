import { useEffect, useRef, useState, useMemo } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useNotifications, useUpdateNotification, useDeleteNotification } from '@/hooks/useSupabaseData';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useWebPush } from '@/hooks/useWebPush';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Bell, AlertTriangle, Package, Clock, CreditCard, Wrench, Trash2, Loader2,
  Search, Filter, MoreHorizontal, Check, Mail, Smartphone, BellRing,
  ShoppingCart, Users, ChevronLeft, ChevronRight, FileText, Settings, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { usePagination } from '@/hooks/usePagination';

import type { LucideIcon } from 'lucide-react';

const typeIcons: Record<string, LucideIcon> = {
  low_stock: Package, expiry: AlertTriangle, pending_return: Clock,
  attendance: Clock, payment: CreditCard, maintenance: Wrench, info: Bell,
  sale: ShoppingCart, vendor: Users,
};

const typeColors: Record<string, string> = {
  low_stock: 'bg-red-50 text-red-600', expiry: 'bg-amber-50 text-amber-600', pending_return: 'bg-blue-50 text-blue-600',
  attendance: 'bg-emerald-50 text-emerald-600', payment: 'bg-purple-50 text-purple-600', maintenance: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600', sale: 'bg-emerald-50 text-emerald-600', vendor: 'bg-purple-50 text-purple-600',
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { selectedOutletId, isAllOutlets, getOutletName } = useOutletContext();
  const { data: notifs = [], isLoading } = useNotifications(isAllOutlets ? 'all' : selectedOutletId);
  const updateNotif = useUpdateNotification();
  const deleteNotif = useDeleteNotification();
  const { viewerProps } = useViewerGuard();
  const { sendLocalNotification, isSubscribed: pushEnabled } = useWebPush();
  const prevCountRef = useRef(0);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Live updates
  useRealtimeSubscription(['notifications']);

  // Send push for new notifications
  const allNotifs = notifs;
  useEffect(() => {
    if (pushEnabled && allNotifs.length > prevCountRef.current && prevCountRef.current > 0) {
      const newest = allNotifs[0];
      if (newest && !newest.read) {
        sendLocalNotification(newest.title, { body: newest.message, tag: newest.id });
      }
    }
    prevCountRef.current = allNotifs.length;
  }, [allNotifs.length, pushEnabled, sendLocalNotification]);

  const unread = allNotifs.filter(n => !n.read);
  const highPriority = allNotifs.filter(n => n.priority === 'high');

  const markRead = (id: string) => updateNotif.mutate({ id, read: true });
  const markAllRead = () => unread.forEach(n => updateNotif.mutate({ id: n.id, read: true }));
  const dismissNotif = (id: string) => deleteNotif.mutate(id);

  // Filter notifications
  const filtered = useMemo(() => {
    let items = allNotifs;
    if (activeTab === 'unread') items = unread;
    else if (activeTab === 'important') items = highPriority;
    else if (activeTab === 'system') items = allNotifs.filter(n => n.type === 'maintenance' || n.type === 'info');
    else if (activeTab === 'sales') items = allNotifs.filter(n => n.type === 'sale' || n.type === 'payment');
    else if (activeTab === 'inventory') items = allNotifs.filter(n => n.type === 'low_stock' || n.type === 'expiry');
    if (search) items = items.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [allNotifs, unread, highPriority, activeTab, search]);

  const { paginatedItems, currentPage, totalPages, totalItems, goToPage, hasNextPage, hasPrevPage } = usePagination(filtered, 10);

  // Derived stats
  const todayNotifs = allNotifs.filter(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread', count: unread.length },
    { key: 'important', label: 'Important' },
    { key: 'system', label: 'System' },
    { key: 'sales', label: 'Sales' },
    { key: 'inventory', label: 'Inventory' },
  ];

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Stay updated with important activities and alerts across your distribution network.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread.length === 0} {...viewerProps}>
            <Check className="h-4 w-4 mr-1.5" />Mark all as read
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">{tab.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Notification List */}
        <div className="lg:col-span-3 space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>

          {/* Notification Items */}
          {paginatedItems.length === 0 ? (
            <Card><CardContent className="text-center py-12 text-muted-foreground">No notifications yet.</CardContent></Card>
          ) : (
            paginatedItems.map(n => {
              const Icon = typeIcons[n.type] || Bell;
              const colorClass = typeColors[n.type] || 'bg-blue-50 text-blue-600';
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30 ${!n.read ? 'bg-primary/[0.02] border-primary/10' : ''}`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${!n.read ? '' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    {n.action_url && (
                      <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary mt-1" onClick={(e) => { e.stopPropagation(); navigate(n.action_url); }}>
                        View Details →
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(n.created_at)}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} notifications</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasPrevPage} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                  <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => goToPage(i + 1)}>{i + 1}</Button>
                ))}
                {totalPages > 3 && <span className="px-1">...</span>}
                {totalPages > 3 && <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goToPage(totalPages)}>{totalPages}</Button>}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notification Settings */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Notification Settings</CardTitle>
              <p className="text-xs text-muted-foreground">Manage how you receive notifications.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Bell, label: 'In-App Notifications', desc: 'Receive notifications in the application', defaultOn: true },
                { icon: Mail, label: 'Email Notifications', desc: 'Receive notifications via email', defaultOn: true },
                { icon: Smartphone, label: 'SMS Notifications', desc: 'Receive notifications via SMS', defaultOn: false },
                { icon: BellRing, label: 'Push Notifications', desc: 'Receive push notifications', defaultOn: pushEnabled },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><setting.icon className="h-4 w-4 text-muted-foreground" /></div>
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={setting.defaultOn} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Notification Summary</CardTitle>
              <p className="text-xs text-muted-foreground">Overview of your notifications.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Bell, label: 'Total Notifications', value: allNotifs.length, color: 'bg-blue-50 text-blue-600' },
                { icon: AlertTriangle, label: 'Unread Notifications', value: unread.length, color: 'bg-red-50 text-red-600' },
                { icon: Shield, label: 'Important Notifications', value: highPriority.length, color: 'bg-amber-50 text-amber-600' },
                { icon: Clock, label: "Today's Notifications", value: todayNotifs.length, color: 'bg-emerald-50 text-emerald-600' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { icon: FileText, label: 'View Audit Logs', onClick: () => navigate('/audit') },
                { icon: Settings, label: 'Notification Preferences', onClick: () => navigate('/settings/notifications') },
                { icon: Trash2, label: 'Clear All Notifications', onClick: () => {}, color: 'text-red-500' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <action.icon className={`h-4 w-4 ${action.color || 'text-muted-foreground'}`} />
                    <span className={`text-sm ${action.color || ''}`}>{action.label}</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
