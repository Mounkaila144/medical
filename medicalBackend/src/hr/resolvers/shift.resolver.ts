import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ShiftService } from '../services/shift.service';
import { Shift } from '../entities/shift.entity';
import { ShiftDto, CreateShiftInput, UpdateShiftInput } from '../dtos/shift.dto';

@Resolver(() => ShiftDto)
export class ShiftResolver {
  constructor(private readonly shiftService: ShiftService) {}

  @Query(() => [ShiftDto])
  async shifts(): Promise<Shift[]> {
    return this.shiftService.findAll();
  }

  @Query(() => [ShiftDto])
  async shiftsByStaff(@Args('staffId') staffId: string): Promise<Shift[]> {
    return this.shiftService.findByStaff(staffId);
  }

  @Query(() => [ShiftDto])
  async shiftsByDateRange(
    @Args('start') start: Date,
    @Args('end') end: Date,
  ): Promise<Shift[]> {
    return this.shiftService.findByDateRange(start, end);
  }

  @Query(() => ShiftDto)
  async shift(@Args('id') id: string): Promise<Shift> {
    return this.shiftService.findOne(id);
  }

  @Mutation(() => ShiftDto)
  async createShift(
    @Args('createShiftInput') createShiftInput: CreateShiftInput,
  ): Promise<Shift> {
    return this.shiftService.create(createShiftInput);
  }

  @Mutation(() => ShiftDto)
  async updateShift(
    @Args('id') id: string,
    @Args('updateShiftInput') updateShiftInput: UpdateShiftInput,
  ): Promise<Shift> {
    return this.shiftService.update(id, updateShiftInput);
  }

  @Mutation(() => Boolean)
  async removeShift(@Args('id') id: string): Promise<boolean> {
    return this.shiftService.remove(id);
  }
} 