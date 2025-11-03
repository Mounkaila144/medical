import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Staff } from './staff.entity';

@ObjectType()
@Entity('shift')
export class Shift {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  staffId: string;

  @Field(() => Staff)
  @ManyToOne(() => Staff, staff => staff.shifts)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Field()
  @Column({ type: 'timestamp' })
  startAt: Date;

  @Field()
  @Column({ type: 'timestamp' })
  endAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 