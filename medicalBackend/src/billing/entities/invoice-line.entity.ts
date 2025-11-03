import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Invoice } from './invoice.entity';

@ObjectType()
@Entity('invoice_lines')
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  @Field(() => Invoice)
  invoice: Invoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column()
  @Field()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  qty: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  @Field()
  unitPrice: number;

  @Column({ name: 'third_party_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Field()
  thirdPartyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Field()
  tax: number;
} 