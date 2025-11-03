import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TariffCategory } from '../src/billing/entities/tariff.entity';

@Controller('tariffs')
export class MockTariffsController {
  // ID de tenant fixe pour les tests
  private readonly tenantId = '2090087a-bf51-42e6-91ed-9f6564448de4';

  @Post()
  async create(@Body() createTariffDto: any) {
    return {
      code: createTariffDto.code,
      label: createTariffDto.label,
      price: createTariffDto.price,
      category: createTariffDto.category,
      tenantId: this.tenantId
    };
  }

  @Get()
  async findAll() {
    return [{
      code: 'CONS001',
      label: 'Consultation standard',
      price: '50.00',
      category: 'CONSULTATION',
      tenantId: this.tenantId
    }];
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: TariffCategory) {
    return [{
      code: 'CONS001',
      label: 'Consultation standard',
      price: '50.00',
      category,
      tenantId: this.tenantId
    }];
  }
} 