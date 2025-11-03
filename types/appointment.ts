// types/appointment.ts

export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type AppointmentUrgency = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// Interface complète (avec id obligatoire)
export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  startAt: string;
  endAt: string;
  room?: string;
  reason: string;
  urgency: AppointmentUrgency;
  status: AppointmentStatus;
  cancellationReason?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  practitioner?: {
    id: string;
    firstName: string;
    lastName: string;
    speciality: string;
  };
  patientName?: string;
  doctorName?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

// Nouveau type pour la création d’un rendez-vous
export type CreateAppointmentDTO = Omit<Appointment, "id" | "patient" | "practitioner" | "patientName" | "doctorName" | "startTime" | "endTime" | "createdAt" | "updatedAt">;
