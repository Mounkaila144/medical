import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExpenseCategory, ExpenseStatus, PaymentStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  supplierContact?: string;

  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsDateString()
  expenseDate: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

@InputType()
export class CreateExpenseGqlDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => ExpenseCategory)
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @Field()
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  supplierName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  supplierContact?: string;

  @Field(() => ExpenseStatus, { nullable: true })
  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @Field(() => PaymentStatus, { nullable: true })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @Field()
  @IsDateString()
  expenseDate: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
