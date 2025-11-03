import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult } from '../entities/lab-result.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';

@Injectable()
export class LabResultsService {
  constructor(
    @InjectRepository(LabResult)
    private labResultsRepository: Repository<LabResult>,
  ) {}

  async add(tenantId: string, createLabResultDto: CreateLabResultDto): Promise<LabResult> {
    const labResult = this.labResultsRepository.create({
      tenantId,
      patientId: createLabResultDto.patientId,
      encounterId: createLabResultDto.encounterId,
      labName: createLabResultDto.labName,
      result: createLabResultDto.result,
      filePath: createLabResultDto.filePath,
      receivedAt: createLabResultDto.receivedAt || new Date(),
    });

    return this.labResultsRepository.save(labResult);
  }

  async findAll(tenantId: string): Promise<LabResult[]> {
    return this.labResultsRepository.find({
      where: { tenantId },
      relations: ['patient', 'encounter'],
    });
  }

  async findAllByPatient(tenantId: string, patientId: string): Promise<LabResult[]> {
    return this.labResultsRepository.find({
      where: { tenantId, patientId },
      relations: ['encounter'],
      order: { receivedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LabResult> {
    const labResult = await this.labResultsRepository.findOne({
      where: { id },
      relations: ['patient', 'encounter'],
    });

    if (!labResult) {
      throw new NotFoundException(`Résultat d'analyse avec ID ${id} non trouvé`);
    }

    return labResult;
  }
} 