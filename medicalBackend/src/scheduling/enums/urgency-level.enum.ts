import { registerEnumType } from '@nestjs/graphql';

export enum UrgencyLevel {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
}

registerEnumType(UrgencyLevel, {
  name: 'UrgencyLevel',
}); 