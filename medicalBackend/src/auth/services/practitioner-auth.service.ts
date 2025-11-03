import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { User } from '../entities/user.entity';
import { AuthUserRole } from '../entities/user.entity';

@Injectable()
export class PractitionerAuthService {
  constructor(
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validatePractitioner(userId: string): Promise<Practitioner | null> {
    // Vérifier que l'utilisateur a le rôle PRACTITIONER
    const user = await this.userRepository.findOne({
      where: { id: userId, role: AuthUserRole.PRACTITIONER },
    });

    if (!user) {
      return null;
    }

    // Trouver le praticien associé à cet utilisateur
    const practitioner = await this.practitionerRepository.findOne({
      where: { userId: userId },
      relations: ['user'],
    });

    return practitioner;
  }

  async getPractitionerByUserId(userId: string): Promise<Practitioner> {
    const practitioner = await this.practitionerRepository.findOne({
      where: { userId: userId },
      relations: ['user'],
    });

    if (!practitioner) {
      throw new NotFoundException('Praticien non trouvé pour cet utilisateur');
    }

    return practitioner;
  }

  async linkUserToPractitioner(userId: string, practitionerId: string): Promise<Practitioner> {
    // Vérifier que l'utilisateur existe et a le bon rôle
    const user = await this.userRepository.findOne({
      where: { id: userId, role: AuthUserRole.PRACTITIONER },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur praticien non trouvé');
    }

    // Vérifier que le praticien existe
    const practitioner = await this.practitionerRepository.findOne({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      throw new NotFoundException('Praticien non trouvé');
    }

    // Lier l'utilisateur au praticien
    practitioner.userId = userId;
    return await this.practitionerRepository.save(practitioner);
  }

  async getAllPractitionersWithUsers(tenantId: string): Promise<Practitioner[]> {
    return await this.practitionerRepository.find({
      where: { tenantId },
      relations: ['user'],
    });
  }
} 