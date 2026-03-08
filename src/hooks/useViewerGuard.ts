import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to check if the current user is a viewer (read-only).
 * Returns `isViewer` boolean and a `viewerProps` object to spread on interactive elements.
 */
export function useViewerGuard() {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';

  /** Spread on buttons/inputs to disable + add title tooltip */
  const viewerProps = isViewer
    ? { disabled: true, title: 'Read-only mode — Viewers cannot modify data' } as const
    : {};

  return { isViewer, viewerProps };
}
