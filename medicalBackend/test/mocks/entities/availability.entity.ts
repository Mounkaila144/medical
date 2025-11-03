import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Practitioner } from './practitioner.entity';
import { RepeatType } from '../../../src/scheduling/enums/repeat-type.enum';

@ObjectType()
@Entity('availabilities')
export class Availability {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'practitioner_id', type: 'uuid' })
  practitionerId: string;

  @Field(() => Int)
  @Column()
  weekday: number;

  @Field()
  @Column({ type: 'text' }) // SQLite ne supporte pas le type 'time'
  start: string;

  @Field()
  @Column({ type: 'text' }) // SQLite ne supporte pas le type 'time'
  end: string;

  @Field(() => RepeatType)
  @Column({
    type: 'text', // SQLite ne supporte pas le type 'enum'
    default: RepeatType.WEEKLY,
  })
  repeat: RepeatType;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.availabilities)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
} 