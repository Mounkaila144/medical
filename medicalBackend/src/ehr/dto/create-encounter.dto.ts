import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateEncounterDto {
  @Field()
  @IsUUID()
  patientId: string;

  @Field()
  @IsUUID()
  practitionerId: string;

  @Field()
  @IsDate()
  startAt: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endAt?: Date;

  @Field()
  @IsString()
  motive: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exam?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  icd10Codes?: string[];
} 