import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Patient } from '../../patients/entities/patient.entity';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { Prescription } from './prescription.entity';
import { LabResult } from './lab-result.entity';

@ObjectType()
@Entity('encounters')
export class Encounter {
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

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'practitioner_id' })
  @Field(() => Practitioner)
  practitioner: Practitioner;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column({ name: 'start_at' })
  @Field()
  startAt: Date;

  @Column({ name: 'end_at', nullable: true })
  @Field({ nullable: true })
  endAt: Date;

  @Column()
  @Field()
  motive: string;

  @Column({ nullable: true, type: 'text' })
  @Field({ nullable: true })
  exam: string;

  @Column({ nullable: true, type: 'text' })
  @Field({ nullable: true })
  diagnosis: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => [String], { nullable: true })
  icd10Codes: string[];

  @Column({ default: false })
  @Field({ defaultValue: false })
  locked: boolean;

  @OneToMany(() => Prescription, (prescription) => prescription.encounter)
  @Field(() => [Prescription], { nullable: true })
  prescriptions: Prescription[];

  @OneToMany(() => LabResult, (labResult) => labResult.encounter)
  @Field(() => [LabResult], { nullable: true })
  labResults: LabResult[];
} 