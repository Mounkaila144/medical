import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

// Entités adaptées pour SQLite
@Entity('tariffs')
export class TestTariff {
  @PrimaryColumn()
  @Field(() => ID)
  code: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @Column()
  @Field()
  label: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  price: number;

  @Column({ type: 'varchar', length: 50 })
  @Field()
  category: string;
}

@Entity('tenants')
export class TestTenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TestUser, user => user.tenant)
  users: TestUser[];
}

@Entity('users')
export class TestUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TestTenant, tenant => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: TestTenant;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TestSession, session => session.user)
  sessions: TestSession[];
}

@Entity('sessions')
export class TestSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TestUser, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: TestUser;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  refreshTokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('patients')
export class TestPatient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_id', type: 'uuid' })
  clinicId: string;

  @Column({ unique: true })
  mrn: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'varchar', length: 1 })
  gender: string;

  @Column({ name: 'blood_type', nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text' })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => TestMedicalHistoryItem, (item) => item.patient)
  medicalHistory: TestMedicalHistoryItem[];

  @OneToMany(() => TestScannedDocument, (document) => document.patient)
  documents: TestScannedDocument[];
}

@Entity('invoices')
export class TestInvoice {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @ManyToOne(() => TestPatient)
  @JoinColumn({ name: 'patient_id' })
  @Field(() => TestPatient)
  patient: TestPatient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ unique: true })
  @Field()
  number: string;

  @Column({ type: 'varchar', length: 50 })
  @Field()
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Field()
  total: number;

  @Column({ name: 'due_at', nullable: true })
  @Field({ nullable: true })
  dueAt: Date;

  @OneToMany(() => TestInvoiceLine, (line) => line.invoice, { cascade: true })
  @Field(() => [TestInvoiceLine], { nullable: true })
  lines: TestInvoiceLine[];

  @OneToMany(() => TestPayment, (payment) => payment.invoice, { cascade: true })
  @Field(() => [TestPayment], { nullable: true })
  payments: TestPayment[];
}

@Entity('invoice_lines')
export class TestInvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => TestInvoice, (invoice) => invoice.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  @Field(() => TestInvoice)
  invoice: TestInvoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column()
  @Field()
  description: string;

  @Column({ type: 'integer' })
  @Field()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  total: number;
}

@Entity('payments')
export class TestPayment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => TestInvoice, (invoice) => invoice.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  @Field(() => TestInvoice)
  invoice: TestInvoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  @Field()
  method: string;

  @Column({ type: 'varchar', nullable: true })
  @Field({ nullable: true })
  reference: string;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;
}

@Entity('medical_history_items')
export class TestMedicalHistoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TestPatient, (patient) => patient.medicalHistory)
  @JoinColumn({ name: 'patient_id' })
  patient: TestPatient;
}

@Entity('scanned_documents')
export class TestScannedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_type' })
  fileType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TestPatient, (patient) => patient.documents)
  @JoinColumn({ name: 'patient_id' })
  patient: TestPatient;
}

@Entity('reports')
export class TestReport {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Field()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  name: string;

  @Column({ type: 'simple-json' })
  @Field()
  params: Record<string, any>;

  @Column({ name: 'generated_path', type: 'varchar', length: 255 })
  @Field()
  generatedPath: string;

  @Column({ type: 'varchar', length: 10 })
  @Field()
  format: string;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;
} 