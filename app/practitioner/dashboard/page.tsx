"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentService } from "@/services/appointment.service";
import { apiClient } from "@/lib/api";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  Activity,
  Loader2,
  Stethoscope,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Appointment, Encounter } from "@/types";

export default function PractitionerDashboard() {
  const router = useRouter();
  const { practitioner, user, getDisplayName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentEncounters, setRecentEncounters] = useState<Encounter[]>([]);
  const [stats, setStats] = useState({
    rdvToday: 0,
    patientsFromRdv: 0,
    consultationsWeek: 0,
  });

  const practitionerId = practitioner?.id || user?.id;
  const displayName = getDisplayName();

  useEffect(() => {
    if (practitionerId) {
      fetchDashboardData();
    }
  }, [practitionerId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's appointments for this practitioner
      const appointmentsResponse = await AppointmentService.getAppointments({
        practitionerId,
        date: today,
      });
      const appointments = appointmentsResponse.data || [];
      setTodayAppointments(appointments);

      // Fetch recent encounters for this practitioner
      let encounters: Encounter[] = [];
      try {
        const encountersResult = await apiClient.get<any>(
          `/encounters?practitionerId=${practitionerId}&limit=5`
        );
        if (Array.isArray(encountersResult)) {
          encounters = encountersResult;
        } else if (encountersResult?.data && Array.isArray(encountersResult.data)) {
          encounters = encountersResult.data;
        } else if (encountersResult?.content && Array.isArray(encountersResult.content)) {
          encounters = encountersResult.content;
        }
      } catch (e) {
        console.warn("Could not fetch encounters:", e);
      }
      setRecentEncounters(encounters);

      // Calculate stats
      const rdvToday = appointments.length;

      // Unique patients from today's appointments
      const uniquePatientIds = new Set(appointments.map((a: Appointment) => a.patientId));
      const patientsFromRdv = uniquePatientIds.size;

      // Consultations this week: count encounters from this week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);

      let weekEncounters = 0;
      try {
        const weekStart = startOfWeek.toISOString().split("T")[0];
        const weekEnd = today;
        const weekResult = await apiClient.get<any>(
          `/encounters?practitionerId=${practitionerId}&startDate=${weekStart}&endDate=${weekEnd}`
        );
        if (Array.isArray(weekResult)) {
          weekEncounters = weekResult.length;
        } else if (weekResult?.data && Array.isArray(weekResult.data)) {
          weekEncounters = weekResult.data.length;
        } else if (weekResult?.total !== undefined) {
          weekEncounters = weekResult.total;
        } else if (weekResult?.content && Array.isArray(weekResult.content)) {
          weekEncounters = weekResult.content.length;
        }
      } catch (e) {
        // Fallback: count from already fetched encounters
        weekEncounters = encounters.filter((enc) => {
          const encDate = new Date(enc.startAt || enc.createdAt);
          return encDate >= startOfWeek;
        }).length;
      }

      setStats({
        rdvToday,
        patientsFromRdv,
        consultationsWeek: weekEncounters,
      });
    } catch (err: any) {
      console.error("Error fetching practitioner dashboard data:", err);
      setError(err.message || "Impossible de charger les donnees du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      SCHEDULED: { label: "Planifie", variant: "outline" },
      CONFIRMED: { label: "Confirme", variant: "default" },
      IN_PROGRESS: { label: "En cours", variant: "secondary" },
      COMPLETED: { label: "Termine", variant: "default" },
      CANCELLED: { label: "Annule", variant: "destructive" },
      NO_SHOW: { label: "Absent", variant: "destructive" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "A l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays}j`;
    } catch {
      return "";
    }
  };

  if (!practitioner && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Acces non autorise</h2>
          <p className="text-gray-600">Vous devez etre connecte en tant que praticien.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">Erreur</div>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Bonjour, Dr. {displayName}
        </h1>
        <p className="text-blue-100 mt-1">
          Bienvenue dans votre espace praticien
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              RDV Aujourd&apos;hui
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rdvToday}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous programmes aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patientsFromRdv}</div>
            <p className="text-xs text-muted-foreground">
              Patients avec RDV aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consultations
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultationsWeek}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mes Rendez-vous du jour
            </CardTitle>
            <CardDescription>
              Vos rendez-vous pour aujourd&apos;hui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun rendez-vous aujourd&apos;hui</p>
                <p className="text-sm text-gray-400 mt-1">
                  Votre journee est libre pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {appointment.patient
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : `Patient #${appointment.patientId}`}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.reason || "Consultation"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(appointment.startAt)}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => router.push("/appointments")}
            >
              Voir tous les rendez-vous
            </Button>
          </CardContent>
        </Card>

        {/* Recent Encounters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activite Recente
            </CardTitle>
            <CardDescription>
              Vos dernieres consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEncounters.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune consultation recente</p>
                <p className="text-sm text-gray-400 mt-1">
                  Vos consultations apparaitront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEncounters.map((encounter) => (
                  <div key={encounter.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {encounter.motive || "Consultation"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {encounter.patient
                          ? `Patient: ${encounter.patient.firstName} ${encounter.patient.lastName}`
                          : `Patient #${encounter.patientId}`}
                        {" - "}
                        {formatRelativeTime(encounter.startAt || encounter.createdAt)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {encounter.status === "COMPLETED"
                          ? "Terminee"
                          : encounter.status === "IN_PROGRESS"
                          ? "En cours"
                          : encounter.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Acces rapide aux fonctionnalites principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              className="h-20 flex flex-col gap-2"
              variant="outline"
              onClick={() => router.push("/appointments")}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Nouveau RDV</span>
            </Button>

            <Button
              className="h-20 flex flex-col gap-2"
              variant="outline"
              onClick={() => router.push("/encounters")}
            >
              <Stethoscope className="h-6 w-6" />
              <span className="text-sm">Nouvelle consultation</span>
            </Button>

            <Button
              className="h-20 flex flex-col gap-2"
              variant="outline"
              onClick={() => router.push("/patients")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Mes patients</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
