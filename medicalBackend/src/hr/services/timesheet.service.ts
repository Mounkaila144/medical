import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet.entity';
import { CreateTimesheetInput, UpdateTimesheetInput } from '../dtos/timesheet.dto';
import { StaffService } from './staff.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TimesheetService {
  constructor(
    @InjectRepository(Timesheet)
    private timesheetRepository: Repository<Timesheet>,
    private staffService: StaffService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Timesheet[]> {
    return this.timesheetRepository.find({ 
      relations: ['staff'],
      order: { year: 'DESC', month: 'DESC' }
    });
  }

  async findByStaff(staffId: string): Promise<Timesheet[]> {
    return this.timesheetRepository.find({ 
      where: { staffId },
      relations: ['staff'],
      order: { year: 'DESC', month: 'DESC' }
    });
  }

  async findByPeriod(month: number, year: number): Promise<Timesheet[]> {
    return this.timesheetRepository.find({
      where: { month, year },
      relations: ['staff']
    });
  }

  async findPendingApproval(): Promise<Timesheet[]> {
    return this.timesheetRepository.find({
      where: { approved: false },
      relations: ['staff'],
      order: { year: 'DESC', month: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Timesheet> {
    const timesheet = await this.timesheetRepository.findOne({ 
      where: { id },
      relations: ['staff']
    });
    if (!timesheet) {
      throw new NotFoundException(`Timesheet with ID ${id} not found`);
    }
    return timesheet;
  }

  async create(createTimesheetInput: CreateTimesheetInput): Promise<Timesheet> {
    // Verify staff exists
    await this.staffService.findOne(createTimesheetInput.staffId);
    
    // Check if timesheet already exists for this period and staff
    const existing = await this.timesheetRepository.findOne({
      where: {
        staffId: createTimesheetInput.staffId,
        month: createTimesheetInput.month,
        year: createTimesheetInput.year
      }
    });
    
    if (existing) {
      throw new BadRequestException(`Timesheet already exists for ${createTimesheetInput.month}/${createTimesheetInput.year}`);
    }
    
    const timesheet = this.timesheetRepository.create(createTimesheetInput);
    const savedTimesheet = await this.timesheetRepository.save(timesheet);
    
    this.eventEmitter.emit('timesheet.created', savedTimesheet);
    
    return savedTimesheet;
  }

  async update(id: string, updateTimesheetInput: UpdateTimesheetInput): Promise<Timesheet> {
    const timesheet = await this.findOne(id);
    
    // If already approved, only allow approval status changes
    if (timesheet.approved && updateTimesheetInput.hours !== undefined) {
      throw new BadRequestException('Cannot update hours for approved timesheet');
    }
    
    // If changing approval status to true, emit event
    const becomingApproved = !timesheet.approved && updateTimesheetInput.approved === true;
    
    Object.assign(timesheet, updateTimesheetInput);
    const savedTimesheet = await this.timesheetRepository.save(timesheet);
    
    if (becomingApproved) {
      this.eventEmitter.emit('timesheet.approved', savedTimesheet);
    }
    
    return savedTimesheet;
  }

  async remove(id: string): Promise<boolean> {
    const timesheet = await this.findOne(id);
    
    // Don't allow deletion of approved timesheets
    if (timesheet.approved) {
      throw new BadRequestException('Cannot delete approved timesheet');
    }
    
    const result = await this.timesheetRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 