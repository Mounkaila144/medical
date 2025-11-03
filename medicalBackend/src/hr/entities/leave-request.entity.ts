import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { LeaveStatus } from '../enums/leave-status.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'uuid' })
  @Field()
  staffId: string;

  @ManyToOne(() => Staff, staff => staff.leaveRequests)
  @JoinColumn({ name: 'staffId' })
  @Field(() => Staff)
  staff: Staff;

  @Column({ type: 'date' })
  @Field()
  start: Date;

  @Column({ type: 'date' })
  @Field()
  end: Date;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING
  })
  @Field(() => LeaveStatus)
  status: LeaveStatus;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  comment: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
} 