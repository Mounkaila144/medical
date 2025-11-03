import { registerEnumType } from '@nestjs/graphql';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(LeaveStatus, {
  name: 'LeaveStatus',
}); 