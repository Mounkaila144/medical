import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsObject } from 'class-validator';

@InputType()
export class CreateSupplierInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => String)
  @IsObject()
  contact: Record<string, any>;
}

@InputType()
export class UpdateSupplierInput {
  @Field({ nullable: true })
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsObject()
  contact?: Record<string, any>;
} 