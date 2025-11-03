import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';

@Entity('practitioners')
export class Practitioner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  specialty: string;

  @Column()
  color: string;

  @OneToMany(() => Availability, (availability) => availability.practitioner)
  availabilities: Availability[];

  @OneToMany(() => Appointment, (appointment) => appointment.practitioner)
  appointments: Appointment[];
} 