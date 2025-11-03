import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, AuthUserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['tenant']
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: ['tenant']
    });
  }

  async createByRole(createUserDto: CreateUserDto, createdById?: string): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Si l'utilisateur est un SUPERADMIN, il ne doit pas avoir de tenant
    if (createUserDto.role === AuthUserRole.SUPERADMIN && createUserDto.tenantId) {
      throw new BadRequestException('Un super administrateur ne peut pas être associé à un tenant');
    }

    // Si l'utilisateur est un CLINIC_ADMIN ou EMPLOYEE, il doit avoir un tenant
    if (
      (createUserDto.role === AuthUserRole.CLINIC_ADMIN || createUserDto.role === AuthUserRole.EMPLOYEE) && 
      !createUserDto.tenantId
    ) {
      throw new BadRequestException('Un administrateur de clinique ou un employé doit être associé à un tenant');
    }

    // Hacher le mot de passe
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Créer l'utilisateur
    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      tenantId: createUserDto.tenantId || undefined,
    });

    return this.usersRepository.save(newUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Si le mot de passe est fourni, le hacher
    let passwordHash;
    if (updateUserDto.password) {
      passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Mettre à jour l'utilisateur
    await this.usersRepository.update(id, {
      ...updateUserDto,
      ...(passwordHash && { passwordHash }),
    });

    return this.findById(id);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);

    // Désactiver l'utilisateur
    await this.usersRepository.update(id, { isActive: false });

    return this.findById(id);
  }

  async reactivate(id: string): Promise<User> {
    const user = await this.findById(id);

    // Réactiver l'utilisateur
    await this.usersRepository.update(id, { isActive: true });

    return this.findById(id);
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { tenantId },
      relations: ['tenant'],
    });
  }

  async findAllSuperadmins(): Promise<User[]> {
    // Méthode corrigée pour retourner TOUS les utilisateurs pour un SUPERADMIN
    return this.usersRepository.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOnlySuperadmins(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: AuthUserRole.SUPERADMIN },
      relations: ['tenant'],
      order: { createdAt: 'DESC' }
    });
  }
} 