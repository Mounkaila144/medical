import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

@InputType()
export class UpdateWaitQueueEntryDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  practitionerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}