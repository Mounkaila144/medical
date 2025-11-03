import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UsersService } from './users.service';
import { User, AuthUserRole } from '../entities/user.entity';

@Injectable()
export class SuperadminService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private usersService: UsersService,
  ) {}

  async createTenantWithAdmin(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Vérifier si le slug est unique
    const existingTenant = await this.tenantsRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new BadRequestException('Un tenant avec ce slug existe déjà');
    }

    // Vérifier si l'email de l'administrateur est unique
    const existingUser = await this.usersService.findByEmail(createTenantDto.adminEmail);
    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà');
    }

    // Créer le tenant
    const newTenant = this.tenantsRepository.create({
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      isActive: true,
    });

    const savedTenant = await this.tenantsRepository.save(newTenant);

    // Créer l'administrateur du tenant
    await this.usersService.createByRole({
      email: createTenantDto.adminEmail,
      password: createTenantDto.adminPassword,
      firstName: createTenantDto.adminFirstName,
      lastName: createTenantDto.adminLastName,
      role: AuthUserRole.CLINIC_ADMIN,
      tenantId: savedTenant.id,
    });

    return savedTenant;
  }

  async findAllTenants(): Promise<Tenant[]> {
    return this.tenantsRepository.find({
      relations: ['users'],
    });
  }

  async findTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant avec ID ${id} non trouvé`);
    }

    return tenant;
  }

  async deactivateTenant(id: string): Promise<Tenant> {
    const tenant = await this.findTenantById(id);

    // Désactiver le tenant
    await this.tenantsRepository.update(id, { isActive: false });

    // Désactiver tous les utilisateurs du tenant
    const users = await this.usersService.findAllByTenant(id);
    for (const user of users) {
      await this.usersService.deactivate(user.id);
    }

    return this.findTenantById(id);
  }

  async reactivateTenant(id: string): Promise<Tenant> {
    const tenant = await this.findTenantById(id);

    // Réactiver le tenant
    await this.tenantsRepository.update(id, { isActive: true });

    // Réactiver tous les utilisateurs du tenant
    const users = await this.usersService.findAllByTenant(id);
    for (const user of users) {
      await this.usersService.reactivate(user.id);
    }

    return this.findTenantById(id);
  }
} 