import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../../auth/entities/tenant.entity';
import { StaffRole } from '../enums/staff-role.enum';
import { Shift } from './shift.entity';
import { LeaveRequest } from './leave-request.entity';
import { Timesheet } from './timesheet.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('staff')
export class Staff {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Field(() => StaffRole)
  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.NURSE
  })
  role: StaffRole;

  @Field()
  @Column({ type: 'date' })
  hireDate: Date;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Shift], { nullable: true })
  @OneToMany(() => Shift, shift => shift.staff)
  shifts: Shift[];

  @Field(() => [LeaveRequest], { nullable: true })
  @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.staff)
  leaveRequests: LeaveRequest[];

  @Field(() => [Timesheet], { nullable: true })
  @OneToMany(() => Timesheet, timesheet => timesheet.staff)
  timesheets: Timesheet[];
} 