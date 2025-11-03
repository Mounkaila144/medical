import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class CancelAppointmentDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  notifyPatient?: boolean;
} 