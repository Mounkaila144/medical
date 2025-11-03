import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StaffService } from '../services/staff.service';
import { Staff } from '../entities/staff.entity';
import { StaffDto, CreateStaffInput, UpdateStaffInput } from '../dtos/staff.dto';

@Resolver(() => StaffDto)
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  @Query(() => [StaffDto])
  async staff(): Promise<Staff[]> {
    return this.staffService.findAll();
  }

  @Query(() => [StaffDto])
  async staffByTenant(@Args('tenantId') tenantId: string): Promise<Staff[]> {
    return this.staffService.findAllByTenant(tenantId);
  }

  @Query(() => StaffDto)
  async staffMember(@Args('id') id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }

  @Mutation(() => StaffDto)
  async createStaff(
    @Args('createStaffInput') createStaffInput: CreateStaffInput,
  ): Promise<Staff> {
    return this.staffService.create(createStaffInput);
  }

  @Mutation(() => StaffDto)
  async updateStaff(
    @Args('id') id: string,
    @Args('updateStaffInput') updateStaffInput: UpdateStaffInput,
  ): Promise<Staff> {
    return this.staffService.update(id, updateStaffInput);
  }

  @Mutation(() => Boolean)
  async removeStaff(@Args('id') id: string): Promise<boolean> {
    return this.staffService.remove(id);
  }
} 