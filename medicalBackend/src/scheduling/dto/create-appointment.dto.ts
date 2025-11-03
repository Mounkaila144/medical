import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UrgencyLevel } from '../enums/urgency-level.enum';

@InputType()
export class CreateAppointmentDto {
  @Field()
  @IsUUID()
  patientId: string;

  @Field()
  @IsUUID()
  practitionerId: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  startAt: Date;

  @Field()
  @IsDate()
  @Type(() => Date)
  endAt: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  room?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;

  @Field(() => UrgencyLevel, { defaultValue: UrgencyLevel.ROUTINE })
  @IsEnum(UrgencyLevel)
  @IsOptional()
  urgency?: UrgencyLevel;
} 