import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @IsUUID()
  encounterId: string;

  @IsUUID()
  practitionerId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}

export class PrescriptionItemDto {
  @IsString()
  medication: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

// GraphQL versions for resolvers
@InputType()
export class CreatePrescriptionGqlDto {
  @Field()
  @IsUUID()
  encounterId: string;

  @Field()
  @IsUUID()
  practitionerId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field(() => [PrescriptionItemGqlDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemGqlDto)
  items: PrescriptionItemGqlDto[];
}

@InputType()
export class PrescriptionItemGqlDto {
  @Field()
  @IsString()
  medication: string;

  @Field()
  @IsString()
  dosage: string;

  @Field()
  @IsString()
  frequency: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  duration?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;
} 