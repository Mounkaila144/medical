'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Users,
  Calendar,
  UserCheck,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  ClipboardList,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  UserPlus,
  Shield,
  Link2,
  Stethoscope,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  roles?: string[];
}

export const navigation: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Patients',
    icon: Users,
    href: '/patients'
  },
    {
        title: 'Praticiens',
        href: '/practitioners',
        icon: UserCheck,
        roles: ['SUPERADMIN', 'CLINIC_ADMIN', 'ADMIN'],
    },
    {
        title: 'Consultations',
        icon: Stethoscope,
        children: [
            { title: 'Rencontres', href: '/encounters', icon: FileText },
            { title: 'Prescriptions', href: '/encounters/prescriptions', icon: ClipboardList },
            { title: 'Résultats labo', href: '/encounters/labs', icon: FileText },
        ],
    },
  {
    title: 'Planification',
    icon: Calendar,
    children: [
      { title: 'Calendrier', href: '/appointments', icon: Calendar },
      { title: 'Gestion file d\'attente', href: '/queue/manage', icon: ClipboardList, roles: ['SUPERADMIN', 'CLINIC_ADMIN', 'EMPLOYEE'] },
      { title: 'Liens publics', href: '/queue/public-links', icon: Link2, roles: ['SUPERADMIN', 'CLINIC_ADMIN'] },
    ],
  },

  {
    title: 'Comptabilité',
    icon: DollarSign,
    roles: ['SUPERADMIN', 'CLINIC_ADMIN', 'EMPLOYEE'],
    children: [
      { title: 'Tableau de bord', href: '/accounting/dashboard', icon: BarChart3 },
      { title: 'Factures clients', href: '/accounting/invoices', icon: FileText },
      { title: 'Revenus', href: '/accounting/payments', icon: DollarSign },
      { title: 'Dépenses', href: '/accounting/expenses', icon: DollarSign },
      { title: 'Tarifs & Prix', href: '/accounting/tariffs', icon: DollarSign },
    ],
  },
  {
    title: 'Gestion Utilisateurs',
    icon: Shield,
    roles: ['SUPERADMIN'],
    children: [
      { title: 'Tenants & Cliniques', href: '/admin/tenants', icon: Building },
      { title: 'Utilisateurs', href: '/admin/users', icon: UserPlus },
      { title: 'Permissions', href: '/admin/permissions', icon: Shield },
    ],
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: Settings,
    roles: ['SUPERADMIN'],
  },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole, getUserType } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 h-auto font-normal",
                level > 0 && "ml-4",
                "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-2 h-auto font-normal",
          level > 0 && "ml-4",
          isActive(item.href!)
            ? "bg-primary/15 text-primary border-r-2 border-primary"
            : "hover:bg-primary/10 hover:text-primary"
        )}
        onClick={() => onOpenChange(false)}
        asChild
      >
        <Link href={item.href!}>
          <Icon className="h-5 w-5 shrink-0" />
          <span>{item.title}</span>
        </Link>
      </Button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-4 py-6">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/images/logo.png" alt="Clinoo+" width={150} height={45} className="h-10 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {navigation.map(item => renderNavItem(item))}
              </div>
            </ScrollArea>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-4 py-6">
          {/* Header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/images/logo.png" alt="Clinoo+" width={150} height={45} className="h-10 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {navigation.map(item => renderNavItem(item))}
              </div>
            </ScrollArea>
          </nav>
        </div>
      </div>
    </>
  );
}