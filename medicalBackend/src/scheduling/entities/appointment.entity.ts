import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Practitioner } from './practitioner.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';

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
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @Field()
  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Field()
  @Column({ name: 'end_at', type: 'timestamp' })
  endAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  room: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reason: string;

  @Field(() => UrgencyLevel)
  @Column({
    type: 'enum',
    enum: UrgencyLevel,
    default: UrgencyLevel.ROUTINE,
  })
  urgency: UrgencyLevel;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.appointments)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
} 