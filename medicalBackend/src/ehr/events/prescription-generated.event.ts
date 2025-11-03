import { Prescription } from '../entities/prescription.entity';

export class PrescriptionGeneratedEvent {
  constructor(public readonly prescription: Prescription) {}
} 