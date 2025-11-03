export declare enum TariffCategory {
    CONSULTATION = "CONSULTATION",
    PROCEDURE = "PROCEDURE",
    LABORATORY = "LABORATORY",
    IMAGING = "IMAGING",
    MEDICATION = "MEDICATION",
    OTHER = "OTHER"
}
export declare class Tariff {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    description: string;
    category: TariffCategory;
    costPrice: number;
    price: number;
    currency: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
