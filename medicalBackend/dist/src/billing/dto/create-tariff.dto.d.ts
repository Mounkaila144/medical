import { TariffCategory } from '../entities/tariff.entity';
export declare class CreateTariffDto {
    code: string;
    name: string;
    description?: string;
    category: TariffCategory;
    costPrice?: number;
    price: number;
    currency?: string;
    duration?: number;
    isActive?: boolean;
}
export declare class CreateTariffGqlDto {
    code: string;
    name: string;
    description?: string;
    category: TariffCategory;
    price: number;
    currency?: string;
    duration?: number;
    isActive?: boolean;
}
