export declare class CreatePrescriptionDto {
    encounterId: string;
    practitionerId: string;
    expiresAt?: Date;
    items: PrescriptionItemDto[];
}
export declare class PrescriptionItemDto {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
}
export declare class CreatePrescriptionGqlDto {
    encounterId: string;
    practitionerId: string;
    expiresAt?: Date;
    items: PrescriptionItemGqlDto[];
}
export declare class PrescriptionItemGqlDto {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
}
