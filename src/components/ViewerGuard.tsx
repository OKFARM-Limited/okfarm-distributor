import { Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useViewerGuard } from '@/hooks/useViewerGuard';

/**
 * Displays a read-only banner when the current user is a viewer.
 * Place at the top of any page with interactive forms.
 */
export function ViewerBanner() {
  const { isViewer } = useViewerGuard();
  if (!isViewer) return null;

  return (
    <Alert variant="default" className="border-muted-foreground/30 bg-muted/50">
      <Lock className="h-4 w-4" />
      <AlertDescription className="text-sm">
        You are in <strong>read-only mode</strong>. Viewers cannot create, edit, or delete data.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Wraps children and overlays a lock indicator when user is a viewer.
 * Interactive elements inside will be visually muted.
 */
export function ViewerGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isViewer } = useViewerGuard();

  if (!isViewer) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>
      {fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      )}
    </div>
  );
}
