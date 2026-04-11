'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Breadcrumbs } from './breadcrumbs';
import { ErrorBoundary } from './error-boundary';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_ROUTES, ROLE_DASHBOARD } from '@/lib/role-routes';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, practitioner, isLoading } = useAuth();
  const [roleChecked, setRoleChecked] = useState(false);

  // Don't show layout on auth pages, home page, and public queue pages
  const isPublicQueuePage =
    pathname === '/queue/display' ||
    pathname === '/queue/take-number' ||
    /^\/[^/]+\/queue\/display$/.test(pathname || '') ||
    /^\/[^/]+\/queue\/take-number$/.test(pathname || '');

  const isPublicRoute =
    pathname?.startsWith('/auth/') ||
    pathname === '/' ||
    pathname?.startsWith('/legal') ||
    isPublicQueuePage;

  // Role-based route guard
  useEffect(() => {
    if (isPublicRoute || isLoading) {
      setRoleChecked(true);
      return;
    }

    const role = user?.role || (practitioner ? 'PRACTITIONER' : null);

    if (!role) {
      // Not authenticated yet, let middleware handle redirection
      setRoleChecked(true);
      return;
    }

    const allowedRoutes = ROLE_ROUTES[role] || [];
    const isAllowed = allowedRoutes.some(route => pathname?.startsWith(route));

    if (!isAllowed) {
      const dashboard = ROLE_DASHBOARD[role] || '/dashboard';
      router.push(dashboard);
    } else {
      setRoleChecked(true);
    }
  }, [user, practitioner, pathname, isLoading, isPublicRoute, router]);

  // Reset roleChecked when pathname changes
  useEffect(() => {
    setRoleChecked(false);
  }, [pathname]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show nothing while checking role authorization (prevents flash of unauthorized content)
  if (!roleChecked && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content - add left margin on desktop for sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:pl-64" // Add padding for desktop sidebar (256px = w-64)
      )}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 pb-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
