import { registerEnumType } from '@nestjs/graphql';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
  NO_SHOW = 'NO_SHOW',
}

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
}); 