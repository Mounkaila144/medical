import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateEncounterDto } from './create-encounter.dto';

@InputType()
export class UpdateEncounterDto extends PartialType(CreateEncounterDto) {
  @Field()
  @IsUUID()
  id: string;
} 