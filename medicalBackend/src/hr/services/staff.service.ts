import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffInput, UpdateStaffInput } from '../dtos/staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find();
  }

  async findAllByTenant(tenantId: string): Promise<Staff[]> {
    return this.staffRepository.find({ where: { tenantId } });
  }

  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async create(createStaffInput: CreateStaffInput): Promise<Staff> {
    const staff = this.staffRepository.create(createStaffInput);
    return this.staffRepository.save(staff);
  }

  async update(id: string, updateStaffInput: UpdateStaffInput): Promise<Staff> {
    const staff = await this.findOne(id);
    Object.assign(staff, updateStaffInput);
    return this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.staffRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 