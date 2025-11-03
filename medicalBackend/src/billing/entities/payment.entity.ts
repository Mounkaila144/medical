import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Invoice } from './invoice.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  INSURANCE = 'INSURANCE',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@ObjectType()
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  @Field(() => Invoice)
  invoice: Invoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Column({ name: 'paid_at' })
  @Field()
  paidAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reference: string;
} 