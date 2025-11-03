export declare class CreateEncounterDto {
    patientId: string;
    practitionerId: string;
    startAt: Date;
    endAt?: Date;
    motive: string;
    exam?: string;
    diagnosis?: string;
    icd10Codes?: string[];
}
