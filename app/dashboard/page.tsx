'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard-service';

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  appointmentsByStatus: Partial<{
    COMPLETED: number;
    SCHEDULED: number;
    CONFIRMED: number;
    IN_PROGRESS: number;
    CANCELLED: number;
  }>;
  alerts: {
    id: string | number;
    message: string;
    action: string;
  }[];
  upcomingAppointments: {
    id: string | number;
    patient: string;
    practitioner: string;
    type: string;
    time: string;
  }[];
  recentAppointments: {
    id: string | number;
    patientName: string;
    purpose: string;
    time: string;
    status: 'completed' | 'scheduled' | 'cancelled' | string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, practitioner, getDisplayName, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect role-specific dashboards
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'SUPERADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      if (user.role === 'ACCOUNTANT') {
        router.push('/accounting/dashboard');
        return;
      }
    }
  }, [user, isLoading, router]);

  const displayName = getDisplayName();
  const isPractitioner = Boolean(practitioner);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto" />
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-primary/40 opacity-20 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const {
    totalPatients,
    appointmentsToday,
    monthlyRevenue,
    pendingInvoices,
    appointmentsByStatus = {},
    alerts = [],
    upcomingAppointments = [],
    recentAppointments = [],
  } = stats;

  const totalToday = Object.values(appointmentsByStatus).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
  const completedToday = appointmentsByStatus.COMPLETED ?? 0;
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-cyan rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Bonjour, {displayName} 👋</h1>
            <p className="text-white/80 text-sm md:text-base">Voici un aperçu de votre activité aujourd&apos;hui</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Button asChild className="bg-white text-brand-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
              <Link href="/patients" className="inline-flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Nouveau patient</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/appointments" className="inline-flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap hidden sm:inline">Voir le calendrier</span>
                <span className="whitespace-nowrap sm:hidden">Calendrier</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-brand-blue hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-brand-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">+12%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-brand-cyan hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">RDV Aujourd&apos;hui</CardTitle>
            <div className="p-2 bg-brand-cyan/10 rounded-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-brand-cyan" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{appointmentsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedToday} terminés, {(appointmentsByStatus.SCHEDULED ?? 0) + (appointmentsByStatus.CONFIRMED ?? 0)} à venir
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-brand-green hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Revenus du Mois</CardTitle>
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-brand-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{monthlyRevenue.toLocaleString()} CFA</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">+8%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-brand-teal hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Factures Attente</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">À traiter rapidement</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          {alerts.map(alert => (
            <Card key={alert.id} className="border-l-4 border-l-orange-500 bg-orange-50/50 hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4">
                <div className="flex items-start sm:items-center gap-2 md:gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-xs md:text-sm text-gray-700">{alert.message}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                  <span className="text-xs md:text-sm">{alert.action}</span>
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Progress + Appointments */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-brand-blue">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-brand-blue" />
              </div>
              Progression du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2 font-medium">
                <span className="text-gray-600">Consultations terminées</span>
                <span className="text-brand-blue font-bold">{completedToday}/{totalToday}</span>
              </div>
              <Progress value={completionRate} className="h-3 bg-gray-200" />
              <p className="text-xs text-muted-foreground mt-1.5">{Math.round(completionRate)}% complété</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm pt-2 border-t">
              <div className="bg-primary/5 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">En cours</p>
                <p className="font-bold text-lg text-brand-blue">{appointmentsByStatus.IN_PROGRESS ?? 0}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Annulés</p>
                <p className="font-bold text-lg text-red-600">{appointmentsByStatus.CANCELLED ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-brand-cyan">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <div className="p-2 bg-brand-cyan/10 rounded-lg">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-brand-cyan" />
              </div>
              Prochains RDV
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Rendez-vous à venir aujourd&apos;hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {upcomingAppointments.slice(0, 3).map(appt => (
                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 hover:shadow-md transition-shadow border border-cyan-100">
                  <div className="min-w-0">
                    <p className="font-semibold text-xs md:text-sm text-gray-900 truncate">{appt.patient}</p>
                    <p className="text-xs text-muted-foreground truncate">{appt.practitioner} • {appt.type}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 bg-white text-xs">{appt.time}</Badge>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 md:h-10 md:w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs md:text-sm text-muted-foreground">Aucun rendez-vous programmé aujourd&apos;hui</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-3 md:mt-4 hover:bg-cyan-50" asChild>
              <Link href="/appointments" className="text-xs md:text-sm">
                Voir tous les RDV
                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-brand-teal">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <div className="p-2 bg-brand-teal/10 rounded-lg">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-brand-teal" />
              </div>
              RDV Récents
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Derniers rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {recentAppointments.slice(0, 3).map(appt => (
                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 rounded-lg bg-gradient-to-r from-teal-50 to-green-50 hover:shadow-md transition-shadow border border-teal-100">
                  <div className="min-w-0">
                    <p className="font-semibold text-xs md:text-sm text-gray-900 truncate">{appt.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{appt.purpose} • {new Date(appt.time).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                    {appt.status === 'completed' ? 'Terminé' : appt.status === 'scheduled' ? 'Programmé' : appt.status === 'cancelled' ? 'Annulé' : appt.status}
                  </Badge>
                </div>
              ))}
              {recentAppointments.length === 0 && (
                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                  <Users className="h-8 w-8 md:h-10 md:w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs md:text-sm text-muted-foreground">Aucun rendez-vous récent</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-3 md:mt-4 hover:bg-teal-50" asChild>
              <Link href="/appointments" className="text-xs md:text-sm">
                Voir tous les RDV
                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-t-4 border-t-brand-blue shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-brand-cyan/5">
          <CardTitle className="text-lg md:text-xl">Actions Rapides</CardTitle>
          <CardDescription className="text-xs md:text-sm">Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="w-full h-20 md:h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 hover:shadow-md transition-all group"
              asChild
            >
              <Link href="/patients">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-brand-blue" />
                </div>
                <span className="text-xs md:text-sm font-medium">Nouveau Patient</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 md:h-24 flex-col gap-2 hover:bg-brand-cyan/5 hover:border-brand-cyan/30 hover:shadow-md transition-all group"
              asChild
            >
              <Link href="/appointments">
                <div className="p-2 bg-brand-cyan/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-brand-cyan" />
                </div>
                <span className="text-xs md:text-sm font-medium">Planifier RDV</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 md:h-24 flex-col gap-2 hover:bg-brand-green/5 hover:border-brand-green/30 hover:shadow-md transition-all group"
              asChild
            >
              <Link href="/encounters">
                <div className="p-2 bg-brand-green/10 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-brand-green" />
                </div>
                <span className="text-xs md:text-sm font-medium">Nouvelle Consultation</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 md:h-24 flex-col gap-2 hover:bg-brand-teal/5 hover:border-brand-teal/30 hover:shadow-md transition-all group"
              asChild
            >
              <Link href="/billing/invoices">
                <div className="p-2 bg-brand-teal/10 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-brand-teal" />
                </div>
                <span className="text-xs md:text-sm font-medium">Créer Facture</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
