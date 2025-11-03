import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Practitioner } from './practitioner.entity';
import { AppointmentStatus } from '../../../src/scheduling/enums/appointment-status.enum';
import { UrgencyLevel } from '../../../src/scheduling/enums/urgency-level.enum';

@ObjectType()
@Entity('appointments')
export class Appointment {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Field()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Field()
  @Column({ name: 'practitioner_id', type: 'uuid' })
  practitionerId: string;

  @Field(() => AppointmentStatus)
  @Column({
    type: 'text', // SQLite ne supporte pas le type 'enum'
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @Field()
  @Column({ name: 'start_at', type: 'text' }) // SQLite utilise text au lieu de timestamp with time zone
  startAt: Date;

  @Field()
  @Column({ name: 'end_at', type: 'text' }) // SQLite utilise text au lieu de timestamp with time zone
  endAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  room: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reason: string;

  @Field(() => UrgencyLevel)
  @Column({
    type: 'text', // SQLite ne supporte pas le type 'enum'
    default: UrgencyLevel.ROUTINE,
  })
  urgency: UrgencyLevel;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.appointments)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
} 