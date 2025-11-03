import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BillingAddressDto } from './billing-address.dto';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueAt?: Date;

  @IsUUID()
  @IsOptional()
  encounterId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  issueDate?: Date;

  @IsOptional()
  billingAddress?: BillingAddressDto;

  @IsString()
  @IsOptional()
  notes?: string;
}

// GraphQL version for resolvers
@InputType()
export class CreateInvoiceGqlDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  number?: string;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueAt?: Date;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  encounterId?: string;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  issueDate?: Date;

  @Field(() => BillingAddressDto, { nullable: true })
  @IsOptional()
  billingAddress?: BillingAddressDto;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
} 