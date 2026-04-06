import { useEffect, useRef } from 'react';
import { useOutletContext } from '@/contexts/OutletContext';
import { useNotifications, useUpdateNotification, useDeleteNotification } from '@/hooks/useSupabaseData';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useWebPush } from '@/hooks/useWebPush';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertTriangle, Package, Clock, CreditCard, Wrench, Trash2, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const typeIcons: Record<string, any> = {
  low_stock: Package, expiry: AlertTriangle, pending_return: Clock,
  attendance: Clock, payment: CreditCard, maintenance: Wrench, info: Bell,
};

const typeColors: Record<string, string> = {
  low_stock: 'text-destructive', expiry: 'text-yellow-600', pending_return: 'text-primary',
  attendance: 'text-secondary', payment: 'text-destructive', maintenance: 'text-yellow-600', info: 'text-primary',
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

  // Live updates
  useRealtimeSubscription(['notifications']);

  // Send push for new notifications
  const allNotifs = notifs as any[];
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

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const renderNotif = (n: any) => {
    const Icon = typeIcons[n.type] || Bell;
    return (
      <div key={n.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${n.read ? 'bg-background' : 'bg-primary/5 border-primary/20'}`}>
        <div className={`mt-0.5 ${typeColors[n.type] || 'text-muted-foreground'}`}><Icon className="h-5 w-5" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium text-sm ${n.read ? '' : 'text-foreground'}`}>{n.title}</p>
            <Badge variant={n.priority === 'high' ? 'destructive' : n.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">{n.priority}</Badge>
            {n.outlets?.name && <Badge variant="outline" className="text-[10px]">{n.outlets.name}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
            {!n.read && <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => markRead(n.id)}>Mark Read</Button>}
            {n.action_url && <Button size="sm" variant="link" className="h-6 text-xs px-0" onClick={() => navigate(n.action_url)}>View →</Button>}
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={() => dismissNotif(n.id)}><Trash2 className="h-3 w-3" /></Button>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <ViewerBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
          {!isAllOutlets && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{getOutletName(selectedOutletId)}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread.length === 0} {...viewerProps}>Mark All Read</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{unread.length}</p><p className="text-xs text-muted-foreground">Unread</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{highPriority.length}</p><p className="text-xs text-muted-foreground">High Priority</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{allNotifs.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({allNotifs.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="high">High Priority ({highPriority.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-2">
          {allNotifs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p> : allNotifs.map(renderNotif)}
        </TabsContent>
        <TabsContent value="unread" className="space-y-2">
          {unread.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">All caught up! 🎉</p> : unread.map(renderNotif)}
        </TabsContent>
        <TabsContent value="high" className="space-y-2">
          {highPriority.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No high priority items.</p> : highPriority.map(renderNotif)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
