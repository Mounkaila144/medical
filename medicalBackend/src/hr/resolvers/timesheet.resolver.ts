import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TimesheetService } from '../services/timesheet.service';
import { Timesheet } from '../entities/timesheet.entity';
import { TimesheetDto, CreateTimesheetInput, UpdateTimesheetInput } from '../dtos/timesheet.dto';

@Resolver(() => TimesheetDto)
export class TimesheetResolver {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Query(() => [TimesheetDto])
  async timesheets(): Promise<Timesheet[]> {
    return this.timesheetService.findAll();
  }

  @Query(() => [TimesheetDto])
  async timesheetsByStaff(@Args('staffId') staffId: string): Promise<Timesheet[]> {
    return this.timesheetService.findByStaff(staffId);
  }

  @Query(() => [TimesheetDto])
  async timesheetsByPeriod(
    @Args('month') month: number,
    @Args('year') year: number,
  ): Promise<Timesheet[]> {
    return this.timesheetService.findByPeriod(month, year);
  }

  @Query(() => [TimesheetDto])
  async pendingTimesheets(): Promise<Timesheet[]> {
    return this.timesheetService.findPendingApproval();
  }

  @Query(() => TimesheetDto)
  async timesheet(@Args('id') id: string): Promise<Timesheet> {
    return this.timesheetService.findOne(id);
  }

  @Mutation(() => TimesheetDto)
  async createTimesheet(
    @Args('createTimesheetInput') createTimesheetInput: CreateTimesheetInput,
  ): Promise<Timesheet> {
    return this.timesheetService.create(createTimesheetInput);
  }

  @Mutation(() => TimesheetDto)
  async updateTimesheet(
    @Args('id') id: string,
    @Args('updateTimesheetInput') updateTimesheetInput: UpdateTimesheetInput,
  ): Promise<Timesheet> {
    return this.timesheetService.update(id, updateTimesheetInput);
  }

  @Mutation(() => TimesheetDto)
  async approveTimesheet(
    @Args('id') id: string,
  ): Promise<Timesheet> {
    return this.timesheetService.update(id, { approved: true });
  }

  @Mutation(() => Boolean)
  async removeTimesheet(@Args('id') id: string): Promise<boolean> {
    return this.timesheetService.remove(id);
  }
} 