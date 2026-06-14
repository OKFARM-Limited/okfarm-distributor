import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

/**
 * Full-page centered loading spinner for use in data-fetching pages.
 */
export function PageLoader({ message = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Full-page centered error display with optional retry button.
 */
export function PageError({ message = 'Failed to load data.', onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
