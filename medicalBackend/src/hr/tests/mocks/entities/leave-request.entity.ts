import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Staff } from './staff.entity';

// Enum du statut des congés (adapté pour SQLite)
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Enregistrer l'enum pour GraphQL
registerEnumType(LeaveStatus, {
  name: 'LeaveStatus',
  description: 'Statut des demandes de congé',
});

@ObjectType()
@Entity('leave_request')
export class LeaveRequest {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  staffId: string;

  @Field(() => Staff)
  @ManyToOne(() => Staff, staff => staff.leaveRequests)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Field()
  @Column({ type: 'date' })
  start: Date;

  @Field()
  @Column({ type: 'date' })
  end: Date;

  @Field()
  @Column({ type: 'varchar', default: LeaveStatus.PENDING })
  status: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 