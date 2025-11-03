import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prescription } from './prescription.entity';

@ObjectType()
@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  @Field()
  medication: string;

  @Column()
  @Field()
  dosage: string;

  @Column()
  @Field()
  frequency: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  instructions?: string;
}