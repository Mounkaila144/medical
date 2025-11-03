import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practitioner } from '../entities/practitioner.entity';
import { Availability } from '../entities/availability.entity';
import { CreatePractitionerDto } from '../dto/create-practitioner.dto';
import { DayOfWeek } from '../dto/create-practitioner.dto';
import { UsersService } from '../../auth/services/users.service';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Injectable()
export class PractitionersService {
  private readonly logger = new Logger(PractitionersService.name);

  constructor(
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    private usersService: UsersService,
  ) {}

  async create(tenantId: string, createPractitionerDto: CreatePractitionerDto): Promise<Practitioner> {
    // Générer un email basé sur le nom du praticien si pas fourni
    let email = createPractitionerDto.email;
    if (!email) {
      const cleanFirstName = createPractitionerDto.firstName.toLowerCase().replace(/[^a-z]/g, '');
      const cleanLastName = createPractitionerDto.lastName.toLowerCase().replace(/[^a-z]/g, '');
      email = `${cleanFirstName}.${cleanLastName}@clinic.com`;
      this.logger.log(`Email généré automatiquement: ${email}`);
    }

    // Générer un mot de passe temporaire plus sécurisé
    const temporaryPassword = this.generateTemporaryPassword();
    this.logger.log(`Création d'un compte utilisateur pour le praticien: ${createPractitionerDto.firstName} ${createPractitionerDto.lastName}`);

    // Créer l'utilisateur d'abord
    const user = await this.usersService.createByRole({
      email,
      password: temporaryPassword,
      firstName: createPractitionerDto.firstName,
      lastName: createPractitionerDto.lastName,
      role: AuthUserRole.PRACTITIONER,
      tenantId,
    });

    this.logger.log(`Utilisateur créé avec l'ID: ${user.id}, Email: ${email}`);

    // Create the practitioner avec l'userId
    const practitioner = this.practitionerRepository.create({
      tenantId,
      firstName: createPractitionerDto.firstName,
      lastName: createPractitionerDto.lastName,
      specialty: createPractitionerDto.speciality,
      color: createPractitionerDto.color,
      email: email,
      phoneNumber: createPractitionerDto.phoneNumber,
      slotDuration: createPractitionerDto.slotDuration,
      userId: user.id, // Lier l'utilisateur au praticien
    });

    const savedPractitioner = await this.practitionerRepository.save(practitioner);
    this.logger.log(`Praticien créé avec l'ID: ${savedPractitioner.id}`);

    // Create availabilities for each working hour
    const availabilities = createPractitionerDto.workingHours.flatMap(workingHour => {
      const weekday = this.mapDayOfWeekToNumber(workingHour.dayOfWeek);
      
      return workingHour.slots.map(slot => 
        this.availabilityRepository.create({
          practitionerId: savedPractitioner.id,
          weekday,
          start: slot.start,
          end: slot.end,
        })
      );
    });

    await this.availabilityRepository.save(availabilities);
    this.logger.log(`${availabilities.length} créneaux de disponibilité créés`);

    // Log des informations de connexion
    this.logger.log(`🎉 Praticien créé avec succès !`);
    this.logger.log(`📧 Email de connexion: ${email}`);
    this.logger.log(`🔑 Mot de passe temporaire: ${temporaryPassword}`);
    this.logger.log(`⚠️  Le praticien doit changer son mot de passe lors de la première connexion`);

    return savedPractitioner;
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Assurer qu'il y a au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async findAll(tenantId: string): Promise<Practitioner[]> {
    return this.practitionerRepository.find({
      where: { tenantId },
      relations: ['availabilities', 'user'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Practitioner> {
    const practitioner = await this.practitionerRepository.findOne({
      where: { id, tenantId },
      relations: ['availabilities', 'user'],
    });
    
    if (!practitioner) {
      throw new Error('Practitioner not found');
    }
    
    return practitioner;
  }

  async update(tenantId: string, id: string, updateData: Partial<CreatePractitionerDto>): Promise<Practitioner> {
    const practitioner = await this.findOne(tenantId, id);
    
    // Update practitioner basic info
    if (updateData.firstName) practitioner.firstName = updateData.firstName;
    if (updateData.lastName) practitioner.lastName = updateData.lastName;
    if (updateData.speciality) practitioner.specialty = updateData.speciality;
    if (updateData.color) practitioner.color = updateData.color;
    if (updateData.email !== undefined) practitioner.email = updateData.email;
    if (updateData.phoneNumber !== undefined) practitioner.phoneNumber = updateData.phoneNumber;
    if (updateData.slotDuration !== undefined) practitioner.slotDuration = updateData.slotDuration;
    
    const updatedPractitioner = await this.practitionerRepository.save(practitioner);
    
    // Update working hours/availabilities if provided
    if (updateData.workingHours) {
      // Delete existing availabilities
      await this.availabilityRepository.delete({ practitionerId: id });
      
      // Create new availabilities
      const availabilities = updateData.workingHours.flatMap(workingHour => {
        const weekday = this.mapDayOfWeekToNumber(workingHour.dayOfWeek);
        
        return workingHour.slots.map(slot => 
          this.availabilityRepository.create({
            practitionerId: id,
            weekday,
            start: slot.start,
            end: slot.end,
          })
        );
      });
      
      await this.availabilityRepository.save(availabilities);
      this.logger.log(`${availabilities.length} créneaux de disponibilité mis à jour`);
    }
    
    // Return updated practitioner with relations
    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const practitioner = await this.findOne(tenantId, id);
    
    // Delete availabilities first
    await this.availabilityRepository.delete({ practitionerId: id });
    
    // Delete the practitioner
    await this.practitionerRepository.delete({ id, tenantId });
    
    // Note: We don't delete the user account to preserve login history
    // The user account will be deactivated or can be managed separately
    
    this.logger.log(`Practitioner ${id} and associated data deleted`);
  }

  private mapDayOfWeekToNumber(dayOfWeek: DayOfWeek): number {
    const mapping = {
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
      [DayOfWeek.SUNDAY]: 7,
    };
    return mapping[dayOfWeek];
  }
} 