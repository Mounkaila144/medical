import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { DocumentType } from '../entities/scanned-document.entity';

@InputType()
export class CreateDocumentDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @Field()
  @IsEnum(DocumentType)
  @IsNotEmpty()
  docType: DocumentType;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return value;
  })
  tags?: string[];

  @Field()
  @IsString()
  @IsNotEmpty()
  uploadedBy: string;
} 