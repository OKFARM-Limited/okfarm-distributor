import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudOff, RefreshCw } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, pendingCount, flush } = useOfflineQueue();
  if (isOnline && pendingCount === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <Badge variant="destructive" className="gap-1">
          <CloudOff className="h-3 w-3" /> Offline
        </Badge>
      )}
      {pendingCount > 0 && (
        <>
          <Badge variant="secondary">{pendingCount} queued</Badge>
          {isOnline && (
            <Button size="sm" variant="ghost" onClick={() => flush()} className="h-7 px-2">
              <RefreshCw className="h-3 w-3 mr-1" /> Sync
            </Button>
          )}
        </>
      )}
    </div>
  );
}
