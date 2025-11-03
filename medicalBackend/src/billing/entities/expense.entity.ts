import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ExpenseCategory {
  UTILITIES = 'UTILITIES', // Électricité, eau, internet
  SUPPLIES = 'SUPPLIES', // Fournitures médicales
  MEDICATIONS = 'MEDICATIONS', // Médicaments
  EQUIPMENT = 'EQUIPMENT', // Équipement médical
  SALARIES = 'SALARIES', // Salaires
  RENT = 'RENT', // Loyer
  MAINTENANCE = 'MAINTENANCE', // Maintenance
  INSURANCE = 'INSURANCE', // Assurances
  TAXES = 'TAXES', // Taxes
  MARKETING = 'MARKETING', // Marketing
  OTHER = 'OTHER', // Autres
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

registerEnumType(ExpenseCategory, {
  name: 'ExpenseCategory',
});

registerEnumType(ExpenseStatus, {
  name: 'ExpenseStatus',
});

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

@ObjectType()
@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @Column()
  @Field()
  reference: string;

  @Column()
  @Field()
  description: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  @Field(() => ExpenseCategory)
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  amount: number;

  @Column({ default: 'XOF' })
  @Field()
  currency: string;

  @Column({ name: 'supplier_name', nullable: true })
  @Field({ nullable: true })
  supplierName: string;

  @Column({ name: 'supplier_contact', nullable: true })
  @Field({ nullable: true })
  supplierContact: string;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  @Field(() => ExpenseStatus)
  status: ExpenseStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Column({ name: 'expense_date' })
  @Field()
  expenseDate: Date;

  @Column({ name: 'due_date', nullable: true })
  @Field({ nullable: true })
  dueDate: Date;

  @Column({ name: 'paid_date', nullable: true })
  @Field({ nullable: true })
  paidDate: Date;

  @Column({ name: 'payment_method', nullable: true })
  @Field({ nullable: true })
  paymentMethod: string;

  @Column({ name: 'invoice_number', nullable: true })
  @Field({ nullable: true })
  invoiceNumber: string;

  @Column({ name: 'receipt_url', nullable: true })
  @Field({ nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;
}
