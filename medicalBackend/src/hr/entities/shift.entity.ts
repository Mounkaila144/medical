import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('shifts')
export class Shift {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
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