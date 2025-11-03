import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @Inject('RABBITMQ_SERVICE')
    private rabbitmqClient: ClientProxy,
  ) {}

  async create(createPatientDto: CreatePatientDto, tenantId: string): Promise<Patient> {
    // Convert age to date of birth if age is provided
    const { age, dob: providedDob, ...patientData } = createPatientDto as any;

    let dob: Date | undefined = providedDob;
    if (age !== undefined && age !== null) {
      const derivedDob = new Date();
      derivedDob.setFullYear(derivedDob.getFullYear() - age);
      dob = derivedDob;
    }

    const defaultAddress = { city: 'Niamey' };

    const patient = new Patient();
    Object.assign(patient, {
      ...patientData,
      ...(dob ? { dob } : {}),
      address: patientData.address ?? defaultAddress,
      clinicId: tenantId,
    });

    const savedPatient = await this.patientsRepository.save(patient);
    
    // Publier un événement patient.created
    try {
    this.rabbitmqClient.emit('patient.created', {
      patient: savedPatient,
      timestamp: new Date(),
    });
    } catch (error) {
      console.error('Erreur lors de l\'émission de l\'événement RabbitMQ:', error);
      // Ne pas échouer la création du patient si RabbitMQ n'est pas disponible
    }

    return savedPatient;
  }

  async findAll(tenantId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { clinicId: tenantId },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id, clinicId: tenantId },
      relations: ['medicalHistory', 'documents'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, tenantId: string): Promise<Patient> {
    const patient = await this.findOne(id, tenantId);
    
    // Vérification supplémentaire au cas où l'utilisateur tenterait de changer le tenantId
    if (updatePatientDto.clinicId && updatePatientDto.clinicId !== tenantId) {
      throw new ForbiddenException('Modification du clinicId non autorisée');
    }
    
    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async archive(id: string, tenantId: string): Promise<void> {
    const patient = await this.findOne(id, tenantId);
    await this.patientsRepository.softDelete(patient.id);
  }

  async search(searchParams: SearchPatientDto): Promise<Patient[]> {
    const { search, clinicId, ...filters } = searchParams;
    
    if (!clinicId) {
      throw new ForbiddenException('Accès non autorisé: clinicId requis');
    }
    
    // Construction d'une requête dynamique
    const queryBuilder = this.patientsRepository.createQueryBuilder('patient');
    
    // Filtrage par clinicId obligatoire pour la sécurité multi-tenant
    queryBuilder.where('patient.clinicId = :clinicId', { clinicId });
    
    // Recherche générale
    if (search) {
      queryBuilder.andWhere(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.mrn ILIKE :search OR patient.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Application des filtres spécifiques
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          queryBuilder.andWhere(`patient.${key} ILIKE :${key}`, { [key]: `%${value}%` });
        } else {
          queryBuilder.andWhere(`patient.${key} = :${key}`, { [key]: value });
        }
      }
    });
    
    return queryBuilder.getMany();
  }
} 