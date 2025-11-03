import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Gender } from '../entities/patient.entity';

@InputType()
export class SearchPatientDto {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  clinicId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  mrn?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;
} 