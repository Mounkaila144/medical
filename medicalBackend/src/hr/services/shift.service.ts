import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shift } from '../entities/shift.entity';
import { CreateShiftInput, UpdateShiftInput } from '../dtos/shift.dto';
import { StaffService } from './staff.service';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
    private staffService: StaffService,
  ) {}

  async findAll(): Promise<Shift[]> {
    return this.shiftRepository.find({ relations: ['staff'] });
  }

  async findByStaff(staffId: string): Promise<Shift[]> {
    return this.shiftRepository.find({ 
      where: { staffId },
      relations: ['staff'],
      order: { startAt: 'ASC' }
    });
  }

  async findByDateRange(start: Date, end: Date): Promise<Shift[]> {
    return this.shiftRepository.find({
      where: [
        { startAt: Between(start, end) },
        { endAt: Between(start, end) }
      ],
      relations: ['staff'],
      order: { startAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({ 
      where: { id },
      relations: ['staff']
    });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async create(createShiftInput: CreateShiftInput): Promise<Shift> {
    // Verify staff exists
    await this.staffService.findOne(createShiftInput.staffId);
    
    const shift = this.shiftRepository.create(createShiftInput);
    return this.shiftRepository.save(shift);
  }

  async update(id: string, updateShiftInput: UpdateShiftInput): Promise<Shift> {
    const shift = await this.findOne(id);
    Object.assign(shift, updateShiftInput);
    return this.shiftRepository.save(shift);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.shiftRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 