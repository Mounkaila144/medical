import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { MedicalHistoryType } from '../entities/medical-history-item.entity';
import { Type } from 'class-transformer';

@InputType()
export class CreateMedicalHistoryItemDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @Field()
  @IsEnum(MedicalHistoryType)
  @IsNotEmpty()
  type: MedicalHistoryType;

  @Field()
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  note: string;
} 