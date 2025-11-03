import { Column, Entity, OneToMany, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';
import { User } from '../../auth/entities/user.entity';

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  @Column({ name: 'slot_duration', type: 'int', nullable: true, default: 30 })
  slotDuration: number;

  @Field({ nullable: true })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Availability, (availability) => availability.practitioner)
  availabilities: Availability[];

  @OneToMany(() => Appointment, (appointment) => appointment.practitioner)
  appointments: Appointment[];
} 