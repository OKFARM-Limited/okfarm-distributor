import React, { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Detects whether an error is a chunk/dynamic-import loading failure.
 * These occur when Vite's hashed chunk files change between deployments
 * but the browser still holds a stale reference to the old filenames.
 */
function isChunkLoadError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    (error.name === 'TypeError' && msg.includes('failed to fetch'))
  );
}

const RELOAD_KEY = 'chunk_error_reload';

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // If this is a stale-chunk error, try a single automatic reload.
    // We set a sessionStorage flag so we don't loop forever.
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, '1');
        window.location.reload();
        return;
      }
      // If we already reloaded once, fall through to the manual UI.
    }

    // Clear the flag on any non-chunk error so future chunk errors
    // can still auto-reload.
    sessionStorage.removeItem(RELOAD_KEY);
  }

  handleReset = () => {
    sessionStorage.removeItem(RELOAD_KEY);
    this.setState({ hasError: false, error: null });
  };

  handleHardReload = () => {
    sessionStorage.removeItem(RELOAD_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunk = this.state.error && isChunkLoadError(this.state.error);

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>
                {isChunk ? 'New Version Available' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {isChunk
                  ? 'A new version of the app has been deployed. Please reload to get the latest version.'
                  : 'An unexpected error occurred. You can try refreshing this section.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {this.state.error && !isChunk && (
                <p className="text-xs text-muted-foreground font-mono bg-muted rounded p-2 w-full text-center truncate">
                  {this.state.error.message}
                </p>
              )}
              <div className="flex gap-2">
                {!isChunk && (
                  <Button variant="outline" size="sm" onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                )}
                <Button
                  variant={isChunk ? 'default' : 'outline'}
                  size="sm"
                  onClick={this.handleHardReload}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
