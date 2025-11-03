import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Practitioner } from './practitioner.entity';

// Remplacer les enums par des chaînes pour SQLite
export enum RepeatType {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  ONCE = 'ONCE'
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'practitioner_id' })
  practitionerId: string;

  @Column()
  weekday: number;

  @Column({ type: 'text' })
  start: string;

  @Column({ type: 'text' })
  end: string;

  @Column({
    type: 'text',
    default: RepeatType.WEEKLY
  })
  repeat: string;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.availabilities)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;
} 