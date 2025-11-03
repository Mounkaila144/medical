import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class RescheduleAppointmentDto {
  @Field()
  @IsUUID()
  appointmentId: string;

  @Field()
  @IsDate()
  startAt: Date;

  @Field()
  @IsDate()
  endAt: Date;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  practitionerId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  room?: string;
} 