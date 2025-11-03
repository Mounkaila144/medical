import { Field, ObjectType } from '@nestjs/graphql';
import { Appointment } from '../entities/appointment.entity';

@ObjectType()
export class AgendaDto {
  @Field()
  date: string;

  @Field(() => [Appointment])
  appointments: Appointment[];
} 