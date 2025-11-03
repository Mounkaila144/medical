import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AddInvoiceLineDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  qty: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  thirdPartyRate?: number = 0;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  tax?: number = 0;
}

// GraphQL version for resolvers
@InputType()
export class AddInvoiceLineGqlDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  qty: number;

  @Field()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @Field({ defaultValue: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  thirdPartyRate?: number = 0;

  @Field({ defaultValue: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  tax?: number = 0;
} 