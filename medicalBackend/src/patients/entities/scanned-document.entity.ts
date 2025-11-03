import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Patient } from './patient.entity';

export enum DocumentType {
  ORDONNANCE = 'ORDONNANCE',
  CR = 'CR',
  RADIO = 'RADIO',
}

@ObjectType()
@Entity('scanned_documents')
export class ScannedDocument {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Field()
  @Column()
  path: string;

  @Field()
  @Column({
    name: 'doc_type',
    type: 'enum',
    enum: DocumentType,
  })
  docType: DocumentType;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Field()
  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Field()
  @Column({ name: 'uploaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
} 