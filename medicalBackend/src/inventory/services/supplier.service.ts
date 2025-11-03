import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { Tenant } from '../../auth/entities/tenant.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * Crée un nouveau fournisseur
   */
  async create(
    name: string,
    contact: Record<string, any>,
    tenant: Tenant,
  ): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      name,
      contact,
      tenant,
    });
    
    return this.supplierRepository.save(supplier);
  }

  /**
   * Liste tous les fournisseurs d'un tenant
   */
  async list(tenantId: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { tenant: { id: tenantId } },
    });
  }
} 