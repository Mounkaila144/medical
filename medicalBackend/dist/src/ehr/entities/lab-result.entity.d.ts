import { Patient } from '../../patients/entities/patient.entity';
import { Encounter } from './encounter.entity';
export declare class LabResult {
    id: string;
    tenantId: string;
    patient: Patient;
    patientId: string;
    encounter: Encounter;
    encounterId: string;
    labName: string;
    result: Record<string, any>;
    filePath: string;
    receivedAt: Date;
}
