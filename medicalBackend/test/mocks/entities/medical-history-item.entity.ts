import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Patient } from './patient.entity';

export enum MedicalHistoryType {
  ANTECEDENT = 'ANTECEDENT',
  ALLERGY = 'ALLERGY',
  VACCINE = 'VACCINE',
}

@ObjectType()
@Entity('medical_history_items')
export class MedicalHistoryItem {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Field()
  @Column({
    type: 'simple-enum',  // Utiliser simple-enum au lieu de enum pour SQLite
    enum: MedicalHistoryType,
  })
  type: MedicalHistoryType;

  @Field()
  @Column()
  label: string;

  @Field()
  @Column({ type: 'text' })
  note: string;

  @Field()
  @Column({ name: 'recorded_at', type: 'timestamp' })  // Utiliser datetime au lieu de timestamp pour SQLite
  recordedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
} 