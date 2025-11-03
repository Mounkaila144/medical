import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class BillingAddress {
  @Field()
  line1: string;

  @Field({ nullable: true })
  line2?: string;

  @Field()
  postalCode: string;

  @Field()
  city: string;

  @Field()
  country: string;
}

@InputType()
export class BillingAddressDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  line1: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  line2?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  country: string;
} 