import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class LockEncounterDto {
  @Field()
  @IsUUID()
  id: string;
} 