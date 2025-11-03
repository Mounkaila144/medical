import { Repository } from 'typeorm';
import { Tariff, TariffCategory } from '../entities';
import { CreateTariffGqlDto } from '../dto';
export declare class TariffsResolver {
    private tariffRepository;
    constructor(tariffRepository: Repository<Tariff>);
    tariffs(context: any): Promise<Tariff[]>;
    tariffsByCategory(category: TariffCategory, context: any): Promise<Tariff[]>;
    createTariff(createTariffDto: CreateTariffGqlDto, context: any): Promise<Tariff>;
}
