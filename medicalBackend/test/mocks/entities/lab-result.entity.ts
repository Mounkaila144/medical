import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Patient } from './patient.entity';
import { Encounter } from './encounter.entity';

@ObjectType()
@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  @Field(() => Patient)
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Encounter, (encounter) => encounter.labResults, { nullable: true })
  @JoinColumn({ name: 'encounter_id' })
  @Field(() => Encounter, { nullable: true })
  encounter: Encounter;

  @Column({ name: 'encounter_id', nullable: true })
  encounterId: string;

  @Column({ name: 'lab_name' })
  @Field()
  labName: string;

  // SQLite ne supporte pas JSONB - utiliser TEXT stocké en JSON
  @Column('simple-json')
  @Field()
  result: Record<string, any>;

  @Column({ name: 'file_path', nullable: true })
  @Field({ nullable: true })
  filePath: string;

  @Column({ name: 'received_at' })
  @Field()
  receivedAt: Date;
} 