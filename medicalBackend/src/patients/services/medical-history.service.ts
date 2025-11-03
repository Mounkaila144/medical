import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
import { PatientsService } from './patients.service';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistoryItem)
    private medicalHistoryRepository: Repository<MedicalHistoryItem>,
    private patientsService: PatientsService,
  ) {}

  async addItem(createItemDto: CreateMedicalHistoryItemDto, clinicId: string): Promise<MedicalHistoryItem> {
    // Vérifier que le patient existe et appartient à la clinique
    await this.patientsService.findOne(createItemDto.patientId, clinicId);
    
    const historyItem = this.medicalHistoryRepository.create({
      ...createItemDto,
      recordedAt: new Date(),
    });
    
    return this.medicalHistoryRepository.save(historyItem);
  }

  async remove(id: string, clinicId: string): Promise<void> {
    const item = await this.medicalHistoryRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!item) {
      throw new NotFoundException(`Medical history item with ID ${id} not found`);
    }

    // Vérifier que le patient appartient à la clinique (sécurité multi-tenant)
    if (item.patient.clinicId !== clinicId) {
      throw new NotFoundException(`Medical history item with ID ${id} not found`);
    }

    await this.medicalHistoryRepository.remove(item);
  }

  async listByPatient(patientId: string, clinicId: string): Promise<MedicalHistoryItem[]> {
    // Vérifier que le patient existe et appartient à la clinique
    await this.patientsService.findOne(patientId, clinicId);
    
    return this.medicalHistoryRepository.find({
      where: { patientId },
      order: { recordedAt: 'DESC' },
    });
  }
} 