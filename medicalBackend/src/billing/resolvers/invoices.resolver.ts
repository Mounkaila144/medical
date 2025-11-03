import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities';
import { InvoicingService } from '../services';
import { CreateInvoiceGqlDto, AddInvoiceLineGqlDto, UpdateInvoiceStatusDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => Invoice)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesResolver {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private invoicingService: InvoicingService,
  ) {}

  @Query(() => [Invoice])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async invoices(@Context() context) {
    return this.invoiceRepository.find({
      where: { tenantId: context.req.user.tenantId },
      relations: ['patient', 'lines', 'payments'],
    });
  }

  @Query(() => Invoice)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async invoice(@Args('id') id: string, @Context() context) {
    return this.invoiceRepository.findOne({
      where: { id, tenantId: context.req.user.tenantId },
      relations: ['patient', 'lines', 'payments'],
    });
  }

  @Mutation(() => Invoice)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async createInvoice(
    @Args('createInvoiceDto') createInvoiceDto: CreateInvoiceGqlDto,
    @Context() context,
  ) {
    return this.invoicingService.createDraft(context.req.user.tenantId, createInvoiceDto);
  }

  @Mutation(() => Invoice)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async addInvoiceLine(
    @Args('addLineDto') addLineDto: AddInvoiceLineGqlDto,
    @Context() context,
  ) {
    return this.invoicingService.addLine(context.req.user.tenantId, addLineDto);
  }

  @Mutation(() => Invoice)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async sendInvoice(
    @Args('updateStatusDto') updateStatusDto: UpdateInvoiceStatusDto,
    @Context() context,
  ) {
    return this.invoicingService.send(context.req.user.tenantId, updateStatusDto);
  }

  @Mutation(() => Invoice)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async markInvoicePaid(
    @Args('updateStatusDto') updateStatusDto: UpdateInvoiceStatusDto,
    @Context() context,
  ) {
    return this.invoicingService.markPaid(context.req.user.tenantId, updateStatusDto);
  }

  @Mutation(() => [Invoice])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async remindOverdueInvoices(@Context() context) {
    return this.invoicingService.remindOverdue(context.req.user.tenantId);
  }
} 