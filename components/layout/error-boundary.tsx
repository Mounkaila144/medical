import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState | null {
    // Do not capture auth errors — let the normal auth flow handle them
    if (
      error.message?.includes('401') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('403')
    ) {
      return null;
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl">
                Une erreur inattendue s&apos;est produite
              </CardTitle>
              <CardDescription className="mt-2">
                Nous sommes désolés pour la gêne. Veuillez recharger la page ou retourner au tableau de bord.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-2">
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recharger la page
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="w-full"
              >
                Retour au tableau de bord
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
