import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('timesheets')
export class Timesheet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  staffId: string;

  @Field(() => Staff)
  @ManyToOne(() => Staff, staff => staff.timesheets)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Field()
  @Column({ type: 'integer' })
  month: number;

  @Field()
  @Column({ type: 'integer' })
  year: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
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