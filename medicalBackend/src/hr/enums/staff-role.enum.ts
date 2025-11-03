import { registerEnumType } from '@nestjs/graphql';

export enum StaffRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
}

registerEnumType(StaffRole, {
  name: 'StaffRole',
}); 