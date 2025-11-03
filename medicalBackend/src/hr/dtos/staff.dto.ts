import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { StaffRole } from '../enums/staff-role.enum';
import { IsDate, IsDecimal, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class StaffDto {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => StaffRole)
  role: StaffRole;

  @Field()
  hireDate: Date;

  @Field()
  salary: number;
}

@InputType()
export class CreateStaffInput {
  @Field()
  @IsUUID()
  tenantId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field(() => StaffRole)
  @IsEnum(StaffRole)
  role: StaffRole;

  @Field()
  @IsDate()
  hireDate: Date;

  @Field()
  @IsDecimal()
  salary: number;
}

@InputType()
export class UpdateStaffInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @Field(() => StaffRole, { nullable: true })
  @IsEnum(StaffRole)
  role?: StaffRole;

  @Field({ nullable: true })
  @IsDate()
  hireDate?: Date;

  @Field({ nullable: true })
  @IsDecimal()
  salary?: number;
} 