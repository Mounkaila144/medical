import { Repository } from 'typeorm';
import { Tariff, TariffCategory } from '../entities';
import { CreateTariffDto } from '../dto';
export declare class TariffsController {
    private tariffRepository;
    constructor(tariffRepository: Repository<Tariff>);
    create(createTariffDto: CreateTariffDto, req: any): Promise<Tariff>;
    findAll(req: any, category?: TariffCategory, isActive?: string, search?: string): Promise<Tariff[]>;
    findOne(id: string, req: any): Promise<Tariff | null>;
    findByCategory(category: TariffCategory, req: any): Promise<Tariff[]>;
    update(id: string, updateTariffDto: Partial<CreateTariffDto>, req: any): Promise<Tariff | null>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
