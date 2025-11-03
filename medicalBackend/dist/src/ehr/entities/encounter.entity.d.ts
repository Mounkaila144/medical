import { Patient } from '../../patients/entities/patient.entity';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { Prescription } from './prescription.entity';
import { LabResult } from './lab-result.entity';
export declare class Encounter {
    id: string;
    tenantId: string;
    patient: Patient;
    patientId: string;
    practitioner: Practitioner;
    practitionerId: string;
    startAt: Date;
    endAt: Date;
    motive: string;
    exam: string;
    diagnosis: string;
    icd10Codes: string[];
    locked: boolean;
    prescriptions: Prescription[];
    labResults: LabResult[];
}
