import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { LeaveStatus } from '../enums/leave-status.enum';

@ObjectType()
export class LeaveRequestDto {
  @Field(() => ID)
  id: string;

  @Field()
  staffId: string;

  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field(() => LeaveStatus)
  status: LeaveStatus;
}

@InputType()
export class CreateLeaveRequestInput {
  @Field()
  @IsUUID()
  staffId: string;

  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;
}

@InputType()
export class UpdateLeaveRequestInput {
  @Field(() => LeaveStatus)
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}

@InputType()
export class ApproveLeaveRequestInput {
  @Field()
  @IsUUID()
  id: string;

  @Field(() => LeaveStatus)
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @Field({ nullable: true })
  @IsString()
  comment?: string;
} 