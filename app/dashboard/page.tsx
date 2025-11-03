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
  const { user, practitioner, getDisplayName, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Chargement...</p>
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
    alerts,
    upcomingAppointments,
    recentAppointments,
  } = stats;

  const totalToday = Object.values(appointmentsByStatus).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
  const completedToday = appointmentsByStatus.COMPLETED ?? 0;
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bonjour, {displayName} 👋</h1>
          <p className="text-gray-600 mt-1">Voici un aperçu de votre activité aujourd’hui</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/patients"><Plus className="h-4 w-4 mr-2" />Nouveau patient</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/appointments"><Calendar className="h-4 w-4 mr-2" />Voir le calendrier</Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+12%</span> par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">RDV Aujourd’hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {completedToday} terminés, {(appointmentsByStatus.SCHEDULED ?? 0) + (appointmentsByStatus.CONFIRMED ?? 0)} à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+8%</span> par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Factures en Attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">À traiter rapidement</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map(alert => (
            <Card key={alert.id} className="border-l-4 border-l-orange-500">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Button variant="outline" size="sm">{alert.action}<ArrowRight className="h-4 w-4 ml-2" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Progress + Appointments */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Progression du Jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Consultations terminées</span><span>{completedToday}/{totalToday}</span></div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">En cours</p><p className="font-semibold">{appointmentsByStatus.IN_PROGRESS ?? 0}</p></div>
              <div><p className="text-muted-foreground">Annulés</p><p className="font-semibold">{appointmentsByStatus.CANCELLED ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Prochains RDV</CardTitle>
            <CardDescription>Rendez-vous à venir aujourd’hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingAppointments.slice(0, 3).map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{appt.patient}</p>
                    <p className="text-xs text-muted-foreground">{appt.practitioner} • {appt.type}</p>
                  </div>
                  <Badge variant="outline">{appt.time}</Badge>
                </div>
              ))}
              {stats.upcomingAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun rendez-vous programmé aujourd’hui</p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/appointments">Voir tous les RDV<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Rendez-vous Récents</CardTitle>
            <CardDescription>Derniers rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAppointments.slice(0, 3).map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{appt.patientName}</p>
                    <p className="text-xs text-muted-foreground">{appt.purpose} • {new Date(appt.time).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                    {appt.status === 'completed' ? 'Terminé' : appt.status === 'scheduled' ? 'Programmé' : appt.status === 'cancelled' ? 'Annulé' : appt.status}
                  </Badge>
                </div>
              ))}
              {stats.recentAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun rendez-vous récent</p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/appointments">Voir tous les RDV<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/patients"><Users className="h-6 w-6" />Nouveau Patient</Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/appointments"><Calendar className="h-6 w-6" />Planifier RDV</Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/encounters"><FileText className="h-6 w-6" />Nouvelle Consultation</Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/billing/invoices"><DollarSign className="h-6 w-6" />Créer Facture</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
