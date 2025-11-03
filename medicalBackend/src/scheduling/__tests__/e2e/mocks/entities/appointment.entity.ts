import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Practitioner } from './practitioner.entity';

// Remplacer les enums par des chaînes pour SQLite
export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum UrgencyLevel {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({
    type: 'text',
    default: AppointmentStatus.BOOKED
  })
  status: string;

  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamp' })
  endAt: Date;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  reason: string;

  @Column({
    type: 'text',
    default: UrgencyLevel.ROUTINE
  })
  urgency: string;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.appointments)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
} 