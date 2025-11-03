// components/appointments/appointment-list.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/types/appointment";
import { AppointmentService } from "@/services/appointment.service";
import { AppointmentDetailsModal } from "./appointment-details-modal";
import { MoreHorizontal, Edit, File, XCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentUpdate?: () => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export function AppointmentList({ appointments, isLoading, onAppointmentUpdate, onAppointmentEdit }: AppointmentListProps) {
  const router = useRouter();
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});
  const [practitionerNames, setPractitionerNames] = useState<Record<string, string>>({});
  const [loadingNames, setLoadingNames] = useState<boolean>(false);

  // Charger les noms des patients et praticiens
  useEffect(() => {
    const loadNames = async () => {
      setLoadingNames(true);
      try {
        // Charger tous les patients
        const patients = await AppointmentService.getPatients();
        const patientMap: Record<string, string> = {};
        patients.forEach((patient: any) => {
          patientMap[patient.id] = `${patient.firstName} ${patient.lastName}`;
        });
        setPatientNames(patientMap);

        // Charger tous les praticiens
        const practitioners = await AppointmentService.getPractitioners();
        const practitionerMap: Record<string, string> = {};
        practitioners.forEach((practitioner: any) => {
          practitionerMap[practitioner.id] = `${practitioner.firstName} ${practitioner.lastName}`;
        });
        setPractitionerNames(practitionerMap);
      } catch (error) {
        console.error("Erreur lors du chargement des noms:", error);
      } finally {
        setLoadingNames(false);
      }
    };

    loadNames();
  }, []);

  const getPatientName = (appointment: Appointment): string => {
    // Essayer différentes propriétés possibles
    if (appointment.patientName) return appointment.patientName;
    if (appointment.patient && typeof appointment.patient === 'object') {
      const patient = appointment.patient as any;
      if (patient.firstName && patient.lastName) {
        return `${patient.firstName} ${patient.lastName}`;
      }
    }
    if (appointment.patientId && patientNames[appointment.patientId]) {
      return patientNames[appointment.patientId];
    }
    if (appointment.patientId) {
      return `Patient #${appointment.patientId}`;
    }
    return 'Patient inconnu';
  };

  const getPractitionerName = (appointment: Appointment): string => {
    // Essayer différentes propriétés possibles
    if (appointment.doctorName) return appointment.doctorName;
    if (appointment.practitioner && typeof appointment.practitioner === 'object') {
      const practitioner = appointment.practitioner as any;
      if (practitioner.firstName && practitioner.lastName) {
        return `${practitioner.firstName} ${practitioner.lastName}`;
      }
    }
    if (appointment.practitionerId && practitionerNames[appointment.practitionerId]) {
      return practitionerNames[appointment.practitionerId];
    }
    if (appointment.practitionerId) {
      return `Praticien #${appointment.practitionerId}`;
    }
    return 'Praticien inconnu';
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    if (onAppointmentEdit) {
      onAppointmentEdit(appointment);
    } else {
      router.push(`/appointments/${appointment.id}/edit`);
    }
  };

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      setUpdatingAppointment(appointmentId);
      await AppointmentService.updateAppointment(appointmentId, { status: "COMPLETED" });
      toast.success("Rendez-vous marqué comme terminé");
      onAppointmentUpdate?.();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous:", error);
      toast.error("Échec de la mise à jour du statut du rendez-vous");
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setUpdatingAppointment(appointmentId);
      await AppointmentService.updateAppointment(appointmentId, { status: "CANCELLED" });
      toast.success("Rendez-vous annulé");
      onAppointmentUpdate?.();
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      toast.error("Échec de l'annulation du rendez-vous");
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '-');
    
    switch (normalizedStatus) {
      case "booked":
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "no-show":
      case "no_show":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "in-progress":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "pending":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '-');
    
    switch (normalizedStatus) {
      case "booked":
      case "scheduled":
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "canceled":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "no-show":
      case "no_show":
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "in-progress":
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Fonction pour formater l'affichage du statut en français
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "BOOKED": "Réservé",
      "SCHEDULED": "Planifié",
      "CONFIRMED": "Confirmé",
      "IN_PROGRESS": "En cours",
      "COMPLETED": "Terminé",
      "CANCELLED": "Annulé",
      "NO_SHOW": "Non présenté",
      "PENDING": "En attente"
    };
    
    return statusMap[status.toUpperCase()] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Formater la date et l'heure
  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '--:--';
    try {
      return format(new Date(dateString), "HH:mm", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return '--:--';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Heure</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Praticien</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">Aucun rendez-vous trouvé</h3>
        <p className="text-muted-foreground mt-2">
          Aucun rendez-vous ne correspond à vos critères.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Heure</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Praticien</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatDateTime(appointment.startAt)}
                </TableCell>
                <TableCell>
                  {loadingNames ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    getPatientName(appointment)
                  )}
                </TableCell>
                <TableCell>
                  {loadingNames ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    getPractitionerName(appointment)
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {appointment.reason || 'Aucun motif spécifié'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(appointment.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                      {formatStatus(appointment.status)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        disabled={updatingAppointment === appointment.id}
                      >
                        <span className="sr-only">Ouvrir le menu</span>
                        {updatingAppointment === appointment.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                        <File className="mr-2 h-4 w-4" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {appointment.status !== "COMPLETED" && (
                        <DropdownMenuItem 
                          onClick={() => handleMarkCompleted(appointment.id)}
                          disabled={updatingAppointment === appointment.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marquer comme terminé
                        </DropdownMenuItem>
                      )}
                      
                      {appointment.status !== "CANCELLED" && (
                        <DropdownMenuItem 
                          onClick={() => handleCancel(appointment.id)}
                          disabled={updatingAppointment === appointment.id}
                          className="text-red-600 focus:text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Annuler le rendez-vous
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={onAppointmentUpdate}
      />
    </>
  );
}