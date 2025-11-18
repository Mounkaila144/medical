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
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <CalendarIcon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              Rendez-vous
            </h2>
            <p className="text-purple-100 text-sm md:text-base">
              Gérez les rendez-vous et consultations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAppointments}
              className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm text-xs md:text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Actualiser
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleCreateAppointment}
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all text-xs md:text-sm"
                  size="sm"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  Nouveau RDV
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
      </div>

      {/* Filters */}
      <Card className="border-t-4 border-t-purple-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            Filtres
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Filtrer les rendez-vous par praticien, statut et date
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
                Praticien
              </label>
              <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
                Statut
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500 hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-yellow-500 hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Planifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500 hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-red-500 hover:scale-105">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Annulés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500 hover:scale-105 col-span-2 md:col-span-1">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.noShow}</p>
                <p className="text-xs text-muted-foreground">Absents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-6">
          <Tabs value={view} onValueChange={setView} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="calendar" className="text-xs md:text-sm">
                <CalendarIcon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                <span className="hidden sm:inline">Vue Calendrier</span>
                <span className="sm:hidden">Calendrier</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs md:text-sm">
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                <span className="hidden sm:inline">Vue Liste</span>
                <span className="sm:hidden">Liste</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <RefreshCw className="h-10 w-10 text-purple-600 animate-spin" />
                  <p className="text-gray-500 font-medium">Chargement du calendrier...</p>
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

            <TabsContent value="list" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <RefreshCw className="h-10 w-10 text-purple-600 animate-spin" />
                  <p className="text-gray-500 font-medium">Chargement de la liste...</p>
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
        </CardContent>
      </Card>

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