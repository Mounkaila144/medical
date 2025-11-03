import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

@ObjectType()
export class ShiftDto {
  @Field(() => ID)
  id: string;

  @Field()
  staffId: string;

  @Field()
  startAt: Date;

  @Field()
  endAt: Date;
}

@InputType()
export class CreateShiftInput {
  @Field()
  @IsUUID()
  staffId: string;

  @Field()
  @IsDate()
  startAt: Date;

  @Field()
  @IsDate()
  endAt: Date;
}

@InputType()
export class UpdateShiftInput {
  @Field({ nullable: true })
  @IsDate()
  startAt?: Date;

  @Field({ nullable: true })
  @IsDate()
  endAt?: Date;
} 