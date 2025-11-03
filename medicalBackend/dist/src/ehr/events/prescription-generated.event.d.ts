import { Prescription } from '../entities/prescription.entity';
export declare class PrescriptionGeneratedEvent {
    readonly prescription: Prescription;
    constructor(prescription: Prescription);
}
