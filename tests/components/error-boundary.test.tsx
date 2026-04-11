import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/layout/error-boundary';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'alert-icon' }),
}));

// Component that throws an error
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return React.createElement('div', null, 'Child content rendered successfully');
}

// Component that throws auth-related errors
function AuthErrorComponent({ errorType }: { errorType: string }) {
  throw new Error(errorType);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React error boundary console errors in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('when no error occurs', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content rendered successfully')).toBeInTheDocument();
    });

    it('does not show error UI', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText(/erreur inattendue/i)).not.toBeInTheDocument();
    });
  });

  describe('when a child throws an error', () => {
    it('shows error UI with French error message', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // The message uses &apos; in JSX which renders as an apostrophe
      expect(screen.getByText(/Une erreur inattendue s.est produite/)).toBeInTheDocument();
    });

    it('shows description text', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Nous sommes d.sol.s pour la g.ne/)).toBeInTheDocument();
    });

    it('does not render child content', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Child content rendered successfully')).not.toBeInTheDocument();
    });

    it('has a reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Recharger la page')).toBeInTheDocument();
    });

    it('reload button calls window.location.reload()', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Recharger la page'));
      expect(reloadMock).toHaveBeenCalled();
    });

    it('has a dashboard navigation button', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Retour au tableau de bord')).toBeInTheDocument();
    });

    it('dashboard button navigates to /dashboard', () => {
      let navigatedTo = '';
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          get href() { return navigatedTo; },
          set href(url: string) { navigatedTo = url; },
          reload: vi.fn(),
        },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Retour au tableau de bord'));
      expect(navigatedTo).toBe('/dashboard');
    });
  });

  describe('auth error passthrough', () => {
    it('does NOT catch 401 errors (returns null from getDerivedStateFromError)', () => {
      // getDerivedStateFromError returns null for auth errors,
      // so the state won't be updated to show error UI.
      // In a real app, the error would propagate up.
      // We test the static method directly.
      const result = ErrorBoundary.getDerivedStateFromError(new Error('401 Unauthorized'));
      expect(result).toBeNull();
    });

    it('does NOT catch Unauthorized errors', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Unauthorized access'));
      expect(result).toBeNull();
    });

    it('does NOT catch 403 errors', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('403 Forbidden'));
      expect(result).toBeNull();
    });

    it('DOES catch regular errors', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Something failed'));
      expect(result).toEqual({ hasError: true, error: expect.any(Error) });
    });

    it('DOES catch errors without auth keywords', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Database connection lost'));
      expect(result).not.toBeNull();
      expect(result!.hasError).toBe(true);
    });
  });
});
