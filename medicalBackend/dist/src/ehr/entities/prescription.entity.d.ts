import { Encounter } from './encounter.entity';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { PrescriptionItem } from './prescription-item.entity';
export declare class Prescription {
    id: string;
    encounter: Encounter;
    encounterId: string;
    practitioner: Practitioner;
    practitionerId: string;
    pdfPath: string;
    qr: string;
    expiresAt: Date;
    items: PrescriptionItem[];
}
