// components/appointments/appointment-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppointmentService } from "@/services/appointment.service";
import { Appointment } from "@/types/appointment";
import { toast } from "sonner";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

interface Practitioner {
  id: number;
  firstName: string;
  lastName: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isEdit?: boolean;
}

// Définir les valeurs d'urgence acceptées par l'API (selon Postman)
type ApiAppointmentUrgency = "ROUTINE" | "URGENT";

export default function AppointmentForm({
  appointment,
  onSuccess,
  onCancel,
  onClose,
  isEdit = false,
}: AppointmentFormProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState<number>(30); // Durée par défaut de 30 minutes
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<ApiAppointmentUrgency>("ROUTINE");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Calculer l'heure de fin basée sur l'heure de début et la durée
  useEffect(() => {
    if (startTime && duration > 0) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const endHours = endDate.getHours().toString().padStart(2, '0');
      const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
      
      setEndTime(`${endHours}:${endMinutes}`);
    }
  }, [startTime, duration]);

  // Initialiser les valeurs si en mode édition
  useEffect(() => {
    if (appointment) {
      setSelectedPatient(appointment.patientId.toString());
      setSelectedPractitioner(appointment.practitionerId.toString());

      const startDate = new Date(appointment.startAt);
      setDate(startDate.toISOString().split("T")[0]);
      setStartTime(startDate.toTimeString().slice(0, 5));

      // Calculer la durée à partir des dates de début et fin
      if (appointment.endAt) {
        const endDate = new Date(appointment.endAt);
        const durationMs = endDate.getTime() - startDate.getTime();
        setDuration(Math.round(durationMs / 60000)); // Convertir en minutes
        setEndTime(endDate.toTimeString().slice(0, 5));
      }

      setReason(appointment.reason);

      // Mapper l'urgence depuis l'API (NORMAL, HIGH, etc.) vers le format attendu (ROUTINE, URGENT)
      const urgencyMap: Record<string, ApiAppointmentUrgency> = {
        "NORMAL": "ROUTINE",
        "LOW": "ROUTINE",
        "HIGH": "URGENT",
        "URGENT": "URGENT",
        "ROUTINE": "ROUTINE"
      };

      setUrgency(urgencyMap[appointment.urgency] || "ROUTINE");

      setRoom(appointment.room || "");
    }
  }, [appointment]);

  // Charger patients et praticiens depuis l'API sécurisée
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setAuthError(false);
        const [patientsData, practitionersData] = await Promise.all([
          AppointmentService.getPatients(),
          AppointmentService.getPractitioners(),
        ]);
        setPatients(patientsData);
        setPractitioners(practitionersData);
      } catch (error: any) {
        console.error("Erreur chargement données:", error);
        
        if (error.status === 401) {
          setAuthError(true);
          setError("Session expirée. Veuillez vous reconnecter.");
          toast.error("Session expirée. Redirection vers la page de connexion...");
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError("Erreur lors du chargement des données. Veuillez réessayer.");
        }
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedPractitioner || !date || !startTime || !reason) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const startAt = `${date}T${startTime}:00`;
      const startDateObj = new Date(startAt);
      
      // Validation de la date
      if (isNaN(startDateObj.getTime())) {
        throw new Error("Date ou heure invalide");
      }

      // Utiliser l'heure de fin calculée ou fournie
      let endAtValue: string;
      if (endTime) {
        endAtValue = `${date}T${endTime}:00`;
      } else {
        // Fallback: calculer à partir de la durée
        const endDateObj = new Date(startDateObj.getTime() + duration * 60000);
        endAtValue = endDateObj.toISOString().slice(0, 19);
      }

      // Données à envoyer à l'API (sans le champ status pour la création)
      const appointmentData: any = {
        patientId: selectedPatient,
        practitionerId: selectedPractitioner,
        startAt,
        endAt: endAtValue,
        reason,
        urgency,
        room: room || undefined,
      };

      // Ajouter le status seulement en mode édition
      if (isEdit && appointment) {
        appointmentData.status = appointment.status;
      }

      console.log("Données envoyées à l'API:", appointmentData);

      if (isEdit && appointment) {
        await AppointmentService.updateAppointment(appointment.id, appointmentData);
        toast.success("Rendez-vous modifié avec succès");
      } else {
        await AppointmentService.createAppointment(appointmentData);
        toast.success("Rendez-vous créé avec succès");
      }

      onSuccess?.();
      onClose?.();

      if (!onSuccess && !onClose) {
        router.push("/appointments");
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
      
      if (error.status === 401) {
        setAuthError(true);
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        toast.error("Session expirée. Redirection vers la page de connexion...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.message.includes('patientId') || error.message.includes('practitionerId')) {
        errorMessage = "Patient ou praticien invalide. Veuillez vérifier les sélections.";
      } else if (error.message.includes('startAt') || error.message.includes('endAt')) {
        errorMessage = "Date ou heure invalide. Veuillez vérifier les horaires.";
      } else if (error.message.includes('urgency')) {
        errorMessage = "Niveau d'urgence invalide. Veuillez sélectionner Routine ou Urgent.";
      } else if (error.message.includes('status')) {
        errorMessage = "Erreur de statut. Le champ status ne devrait pas être inclus.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
    if (!onCancel && !onClose) router.push("/appointments");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-2xl mx-auto">
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Votre session a expiré. Vous allez être redirigé vers la page de connexion.</p>
        </div>
      )}
      
      {error && !authError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            type="button" 
            onClick={() => window.location.reload()} 
            className="mt-2"
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Patient et Praticien alignés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient */}
        <div>
          <Label htmlFor="patient">Patient *</Label>
          <select
            id="patient"
            value={selectedPatient}
            onChange={(e) => {
              console.log("Patient changé:", e.target.value);
              setSelectedPatient(e.target.value);
            }}
            className="w-full border rounded p-2"
            required
            disabled={loading || authError}
          >
            <option value="">-- Sélectionner un patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Practitioner */}
        <div>
          <Label htmlFor="practitioner">Praticien *</Label>
          <select
            id="practitioner"
            value={selectedPractitioner}
            onChange={(e) => {
              console.log("Praticien changé:", e.target.value);
              setSelectedPractitioner(e.target.value);
            }}
            className="w-full border rounded p-2"
            required
            disabled={loading || authError}
          >
            <option value="">-- Sélectionner un praticien --</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date et Heures alignées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading || authError}
          />
        </div>

        {/* Heure de début */}
        <div>
          <Label htmlFor="startTime">Heure de début *</Label>
          <Input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={loading || authError}
          />
        </div>

        {/* Heure de fin */}
        <div>
          <Label htmlFor="endTime">Heure de fin</Label>
          <Input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={loading || authError}
            placeholder="Calculée automatiquement"
          />
        </div>
      </div>

      {/* Durée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Durée (minutes)</Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border rounded p-2"
            disabled={loading || authError}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 heure</option>
            <option value={90}>1 heure 30</option>
            <option value={120}>2 heures</option>
          </select>
        </div>

        {/* Urgence */}
        <div>
          <Label htmlFor="urgency">Urgence *</Label>
          <select
            id="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as ApiAppointmentUrgency)}
            className="w-full border rounded p-2"
            required
            disabled={loading || authError}
          >
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Motif et Salle alignés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Motif */}
        <div>
          <Label htmlFor="reason">Motif de consultation *</Label>
          <Input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Consultation de suivi"
            required
            disabled={loading || authError}
          />
        </div>

        {/* Salle */}
        <div>
          <Label htmlFor="room">Salle (optionnel)</Label>
          <Input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Ex: Salle 101"
            disabled={loading || authError}
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel} 
          disabled={loading || authError} 
          className="flex-1"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={loading || authError} 
          className="flex-1"
        >
          {loading ? "Traitement en cours..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}