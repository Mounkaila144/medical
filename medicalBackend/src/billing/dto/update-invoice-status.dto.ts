import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

@InputType()
export class UpdateInvoiceStatusDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @Field(() => InvoiceStatus)
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
} 