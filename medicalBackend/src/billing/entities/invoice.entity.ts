import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Patient } from '../../patients/entities/patient.entity';
import { InvoiceLine } from './invoice-line.entity';
import { Payment } from './payment.entity';
import { BillingAddress } from '../dto/billing-address.dto';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
});

@ObjectType()
@Entity('invoices')
export class Invoice {
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

  @Column({ unique: true })
  @Field()
  number: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Field()
  total: number;

  @Column({ name: 'due_at', nullable: true })
  @Field({ nullable: true })
  dueAt: Date;

  @Column({ name: 'encounter_id', nullable: true })
  @Field({ nullable: true })
  encounterId: string;

  @Column({ name: 'issue_date', nullable: true })
  @Field({ nullable: true })
  issueDate: Date;

  @Column({ type: 'json', nullable: true })
  @Field(() => BillingAddress, { nullable: true })
  billingAddress: BillingAddress;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  notes: string;

  @Column({ name: 'pdf_path', nullable: true })
  @Field({ nullable: true })
  pdfPath: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  qr: string;

  @OneToMany(() => InvoiceLine, (line) => line.invoice, { cascade: true })
  @Field(() => [InvoiceLine], { nullable: true })
  lines: InvoiceLine[];

  @OneToMany(() => Payment, (payment) => payment.invoice, { cascade: true })
  @Field(() => [Payment], { nullable: true })
  payments: Payment[];
} 