import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { TariffCategory } from '../entities/tariff.entity';

export class CreateTariffDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TariffCategory)
  category: TariffCategory;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// GraphQL version for resolvers
@InputType()
export class CreateTariffGqlDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TariffCategory)
  @IsEnum(TariffCategory)
  category: TariffCategory;

  @Field()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  price: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  duration?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 