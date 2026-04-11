'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, FileText, Users, AlertCircle, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { AppointmentService } from '@/services/appointment.service';
import { BillingService } from '@/services/billing.service';

export interface AppNotification {
  id: string;
  type: 'appointment' | 'invoice' | 'queue' | 'system';
  title: string;
  description: string;
  href: string;
  read: boolean;
  createdAt: Date;
}

const typeIcons: Record<AppNotification['type'], React.ReactNode> = {
  appointment: <Calendar className="h-4 w-4 text-blue-500" />,
  invoice: <FileText className="h-4 w-4 text-green-500" />,
  queue: <Users className="h-4 w-4 text-purple-500" />,
  system: <AlertCircle className="h-4 w-4 text-orange-500" />,
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR');
}

export function NotificationCenter() {
  const router = useRouter();
  const { user, practitioner, hasAnyRole } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const generateNotifications = useCallback(async () => {
    const newNotifications: AppNotification[] = [];

    try {
      // Role-based notification generation
      const userRole = user?.role;
      const isPractitioner = !!practitioner;

      // Fetch recent appointments for PRACTITIONER, EMPLOYEE, CLINIC_ADMIN
      if (
        isPractitioner ||
        userRole === 'EMPLOYEE' ||
        userRole === 'CLINIC_ADMIN'
      ) {
        try {
          const appointments = await AppointmentService.getAppointments({});
          const recentAppointments = (appointments || [])
            .sort((a: any, b: any) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
            .slice(0, 5);

          recentAppointments.forEach((apt: any) => {
            newNotifications.push({
              id: `apt-${apt.id}`,
              type: 'appointment',
              title: 'Rendez-vous',
              description: `RDV le ${new Date(apt.startAt).toLocaleDateString('fr-FR')} à ${new Date(apt.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
              href: `/appointments`,
              read: false,
              createdAt: new Date(apt.startAt),
            });
          });
        } catch (err) {
          // Silently fail - don't break notification center
          console.error('Error fetching appointments for notifications:', err);
        }
      }

      // Fetch pending invoices for ACCOUNTANT, CLINIC_ADMIN
      if (
        userRole === 'ACCOUNTANT' ||
        userRole === 'CLINIC_ADMIN'
      ) {
        try {
          const invoiceResponse = await BillingService.getInvoices({ status: 'DRAFT', limit: 5 });
          const pendingInvoices = invoiceResponse?.data || [];

          if (pendingInvoices.length > 0) {
            newNotifications.push({
              id: `inv-pending-${Date.now()}`,
              type: 'invoice',
              title: 'Factures en attente',
              description: `${pendingInvoices.length} facture(s) en attente de validation`,
              href: '/accounting/invoices',
              read: false,
              createdAt: new Date(),
            });
          }
        } catch (err) {
          console.error('Error fetching invoices for notifications:', err);
        }
      }

      // For EMPLOYEE - add queue notifications
      if (userRole === 'EMPLOYEE' || userRole === 'CLINIC_ADMIN') {
        newNotifications.push({
          id: `system-welcome-${Date.now()}`,
          type: 'system',
          title: 'Bienvenue',
          description: 'Vous êtes connecté au système de gestion médicale',
          href: '/dashboard',
          read: true,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error generating notifications:', err);
    }

    // Sort by date descending, limit to 10
    newNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setNotifications(newNotifications.slice(0, 10));
  }, [user, practitioner, hasAnyRole]);

  // Generate notifications on mount and periodically
  useEffect(() => {
    if (!user && !practitioner) return;

    generateNotifications();

    const interval = setInterval(generateNotifications, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, [user, practitioner, generateNotifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
    router.push(notification.href);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {typeIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
