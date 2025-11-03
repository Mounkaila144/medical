import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LeaveService } from '../services/leave.service';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveRequestDto, CreateLeaveRequestInput, UpdateLeaveRequestInput, ApproveLeaveRequestInput } from '../dtos/leave-request.dto';

@Resolver(() => LeaveRequestDto)
export class LeaveResolver {
  constructor(private readonly leaveService: LeaveService) {}

  @Query(() => [LeaveRequestDto])
  async leaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveService.findAll();
  }

  @Query(() => [LeaveRequestDto])
  async leaveRequestsByStaff(@Args('staffId') staffId: string): Promise<LeaveRequest[]> {
    return this.leaveService.findByStaff(staffId);
  }

  @Query(() => [LeaveRequestDto])
  async pendingLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveService.findPendingRequests();
  }

  @Query(() => LeaveRequestDto)
  async leaveRequest(@Args('id') id: string): Promise<LeaveRequest> {
    return this.leaveService.findOne(id);
  }

  @Mutation(() => LeaveRequestDto)
  async createLeaveRequest(
    @Args('createLeaveRequestInput') createLeaveRequestInput: CreateLeaveRequestInput,
  ): Promise<LeaveRequest> {
    return this.leaveService.create(createLeaveRequestInput);
  }

  @Mutation(() => LeaveRequestDto)
  async updateLeaveRequest(
    @Args('id') id: string,
    @Args('updateLeaveRequestInput') updateLeaveRequestInput: UpdateLeaveRequestInput,
  ): Promise<LeaveRequest> {
    return this.leaveService.update(id, updateLeaveRequestInput);
  }

  @Mutation(() => LeaveRequestDto)
  async approveLeaveRequest(
    @Args('approveLeaveRequestInput') approveLeaveRequestInput: ApproveLeaveRequestInput,
  ): Promise<LeaveRequest> {
    return this.leaveService.approveLeaveRequest(approveLeaveRequestInput);
  }

  @Mutation(() => Boolean)
  async removeLeaveRequest(@Args('id') id: string): Promise<boolean> {
    return this.leaveService.remove(id);
  }
} 