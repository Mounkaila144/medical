"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AppointmentForm from "@/components/appointments/appointment-form";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentCalendarView } from "@/components/appointments/appointment-calendar-view";
import { cn } from "@/lib/utils";
import { AppointmentService } from "@/services/appointment.service";
import { practitionersService } from "@/services/practitioners-service";
import { Appointment } from "@/types/appointment";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("calendar");
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("all");
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0
  });

  // Load practitioners
  useEffect(() => {
    const loadPractitioners = async () => {
      try {
        const data = await practitionersService.getPractitioners();
        setPractitioners(data);
      } catch (error) {
        console.error("Error loading practitioners:", error);
        toast.error("Erreur lors du chargement des praticiens");
      }
    };
    loadPractitioners();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        status: statusFilter !== "all" ? statusFilter as any : undefined,
        startDate: format(date, 'yyyy-MM-dd'),
      };

      if (selectedPractitioner !== "all") {
        params.practitionerId = selectedPractitioner;
      }

      const response = await AppointmentService.getAppointments(params);

      // Log pour debug
      console.log('📋 Appointments loaded:', response.data);
      if (response.data.length > 0) {
        console.log('📋 First appointment structure:', response.data[0]);
      }

      // Enrichir les rendez-vous avec les noms des patients si manquants
      const enrichedAppointments = await Promise.all(
        response.data.map(async (appointment: Appointment) => {
          // Si le patient est déjà inclus ou si patientName existe, retourner tel quel
          if (appointment.patient || appointment.patientName) {
            return appointment;
          }

          // Sinon, essayer de charger les données du patient
          try {
            const { PatientService } = await import('@/services/patient.service');
            const patient = await PatientService.getPatientById(appointment.patientId);
            return {
              ...appointment,
              patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                mrn: patient.mrn
              }
            };
          } catch (error) {
            console.warn(`Could not load patient ${appointment.patientId}:`, error);
            return appointment;
          }
        })
      );

      setAppointments(enrichedAppointments);

      // Calculate statistics
      const total = enrichedAppointments.length;
      const scheduled = enrichedAppointments.filter((a: Appointment) => a.status === 'SCHEDULED').length;
      const completed = enrichedAppointments.filter((a: Appointment) => a.status === 'COMPLETED').length;
      const cancelled = enrichedAppointments.filter((a: Appointment) => a.status === 'CANCELLED').length;
      const noShow = enrichedAppointments.filter((a: Appointment) => a.status === 'NO_SHOW').length;

      setStats({ total, scheduled, completed, cancelled, noShow });
    } catch (error) {
      console.error("Erreur fetching appointments:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date, statusFilter, searchQuery, selectedPractitioner]);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleAppointmentCreated = () => {
    setIsCreateModalOpen(false);
    fetchAppointments();
  };

  const handleAppointmentUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rendez-vous</h2>
          <p className="text-muted-foreground">
            Gérez les rendez-vous et consultations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchAppointments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateAppointment}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau rendez-vous
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer nouveau rendez-vous</DialogTitle>
                <DialogDescription>
                  Planifier un nouveau rendez-vous pour un patient.
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm
                onSuccess={handleAppointmentCreated}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Tous les praticiens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les praticiens</SelectItem>
              {practitioners.map((practitioner) => (
                <SelectItem key={practitioner.id} value={practitioner.id}>
                  {practitioner.firstName} {practitioner.lastName}
                  {practitioner.speciality && (
                    <span className="text-muted-foreground ml-2">
                      - {practitioner.speciality}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="SCHEDULED">Planifiés</SelectItem>
              <SelectItem value="CONFIRMED">Confirmés</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="COMPLETED">Terminés</SelectItem>
              <SelectItem value="CANCELLED">Annulés</SelectItem>
              <SelectItem value="NO_SHOW">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP", { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Planifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Annulés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.noShow}</p>
                <p className="text-xs text-muted-foreground">Absents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <AppointmentCalendarView
              appointments={appointments}
              date={date}
              setDate={setDate}
              isLoading={isLoading}
              onAppointmentEdit={handleEditAppointment}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <AppointmentList
              appointments={appointments}
              isLoading={isLoading}
              onAppointmentEdit={handleEditAppointment}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier rendez-vous</DialogTitle>
            <DialogDescription>Mettre à jour les détails du rendez-vous.</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={handleAppointmentUpdated}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}