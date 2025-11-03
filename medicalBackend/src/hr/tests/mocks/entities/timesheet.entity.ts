import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Staff } from './staff.entity';

@ObjectType()
@Entity('timesheet')
export class Timesheet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  staffId: string;

  @Field(() => Staff)
  @ManyToOne(() => Staff, staff => staff.timesheets)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Field(() => Int)
  @Column({ type: 'integer' })
  month: number;

  @Field(() => Int)
  @Column({ type: 'integer' })
  year: number;

  @Field(() => Int)
  @Column({ type: 'integer' })
  hours: number;

  @Field()
  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 