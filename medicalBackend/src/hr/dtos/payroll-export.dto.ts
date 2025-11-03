import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class PayrollExportDto {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  period: string;

  @Field()
  filePath: string;

  @Field()
  generatedAt: Date;
}

@InputType()
export class CreatePayrollExportInput {
  @Field()
  @IsUUID()
  tenantId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  period: string;
} 