import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Tenant } from './tenant.entity';
import { Shift } from './shift.entity';
import { LeaveRequest } from './leave-request.entity';
import { Timesheet } from './timesheet.entity';

// Enum pour les rôles (adaptable pour SQLite)
export enum StaffRole {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  ADMIN = 'ADMIN'
}

// Enregistrer l'enum pour GraphQL
registerEnumType(StaffRole, {
  name: 'StaffRole',
  description: 'Rôles disponibles pour le personnel',
});

@ObjectType()
@Entity('staff')
export class Staff {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  tenantId: string;

  @Field(() => Tenant, { nullable: true })
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  role: string;

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