import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Patient } from './patient.entity';

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
  title: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field()
  @Column()
  filename: string;

  @Field()
  @Column({ name: 'mime_type' })
  mimeType: string;

  @Field()
  @Column()
  path: string;

  @Field()
  @Column({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
} 