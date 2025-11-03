import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsNumber, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ReceiveItemInput {
  @Field()
  @IsUUID()
  itemId: string;

  @Field()
  @IsString()
  lotNumber: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  expiry: Date;

  @Field()
  @IsNumber()
  @Min(0)
  quantity: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;
}

@InputType()
export class DispenseItemInput {
  @Field()
  @IsUUID()
  itemId: string;

  @Field()
  @IsNumber()
  @Min(0)
  quantity: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;
}

@InputType()
export class AdjustItemInput {
  @Field()
  @IsUUID()
  itemId: string;

  @Field()
  @IsUUID()
  lotId: string;

  @Field()
  @IsNumber()
  @Min(0)
  newQuantity: number;

  @Field()
  @IsString()
  reason: string;
} 