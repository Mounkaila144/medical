import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ItemCategory, ItemUnit } from '../entities/item.entity';

@InputType()
export class CreateItemInput {
  @Field()
  @IsString()
  sku: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => String)
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @Field(() => String)
  @IsEnum(ItemUnit)
  unit: ItemUnit;

  @Field()
  @IsNumber()
  @Min(0)
  reorderLevel: number;
}

@InputType()
export class UpdateItemInput {
  @Field({ nullable: true })
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @Field(() => String, { nullable: true })
  @IsEnum(ItemUnit)
  unit?: ItemUnit;

  @Field({ nullable: true })
  @IsNumber()
  @Min(0)
  reorderLevel?: number;
} 