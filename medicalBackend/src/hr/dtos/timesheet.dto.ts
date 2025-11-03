import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDecimal, IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

@ObjectType()
export class TimesheetDto {
  @Field(() => ID)
  id: string;

  @Field()
  staffId: string;

  @Field()
  month: number;

  @Field()
  year: number;

  @Field()
  hours: number;

  @Field()
  approved: boolean;
}

@InputType()
export class CreateTimesheetInput {
  @Field()
  @IsUUID()
  staffId: string;

  @Field()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @Field()
  @IsNumber()
  @Min(2000)
  year: number;

  @Field()
  @IsDecimal()
  hours: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  approved: boolean = false;
}

@InputType()
export class UpdateTimesheetInput {
  @Field({ nullable: true })
  @IsDecimal()
  hours?: number;

  @Field({ nullable: true })
  @IsBoolean()
  approved?: boolean;
} 