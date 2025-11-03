import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';

@ObjectType()
@Entity('practitioners')
export class Practitioner {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Field()
  @Column({ name: 'first_name' })
  firstName: string;

  @Field()
  @Column({ name: 'last_name' })
  lastName: string;

  @Field()
  @Column()
  specialty: string;

  @Field()
  @Column()
  color: string;

  @OneToMany(() => Availability, (availability) => availability.practitioner)
  availabilities: Availability[];

  @OneToMany(() => Appointment, (appointment) => appointment.practitioner)
  appointments: Appointment[];
} 