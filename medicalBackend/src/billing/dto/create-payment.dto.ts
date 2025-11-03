import { Field, InputType } from '@nestjs/graphql';
import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Min, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

// GraphQL version for resolvers
@InputType()
export class CreatePaymentGqlDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @Field()
  @IsDecimal()
  @Min(0.01)
  amount: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;
} 