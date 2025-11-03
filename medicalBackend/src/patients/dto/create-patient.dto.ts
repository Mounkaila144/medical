import { IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Gender } from '../entities/patient.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { Type } from 'class-transformer';

@InputType()
export class CreatePatientDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  clinicId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  mrn?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  age?: number;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dob?: Date;

  @Field()
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

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
} 