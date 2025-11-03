import { IsDate, IsEmail, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Gender } from '../entities/patient.entity';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class UpdatePatientDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dob?: Date;

  @Field({ nullable: true })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bloodType?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  address?: any;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  clinicId?: string;
} 