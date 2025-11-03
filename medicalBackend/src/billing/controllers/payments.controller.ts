import { Controller, Post, Get, Patch, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod } from '../entities/payment.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async recordPayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentsService.recordPayment(req.user.tenantId, createPaymentDto);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async getPayments(
    @Req() req,
    @Query('invoiceId') invoiceId?: string,
    @Query('method') method?: PaymentMethod,
  ) {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .where('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .orderBy('payment.paidAt', 'DESC');

    if (invoiceId) {
      queryBuilder.andWhere('payment.invoiceId = :invoiceId', { invoiceId });
    }

    if (method) {
      queryBuilder.andWhere('payment.method = :method', { method });
    }

    return queryBuilder.getMany();
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async getPayment(@Param('id') id: string, @Req() req) {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .where('payment.id = :id', { id })
      .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .getOne();
  }

  @Patch(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async update(@Param('id') id: string, @Body() updatePaymentDto: Partial<CreatePaymentDto>, @Req() req) {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .where('payment.id = :id', { id })
      .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .getOne();

    if (!payment) {
      throw new Error('Payment not found');
    }

    await this.paymentRepository.update(id, updatePaymentDto);

    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .where('payment.id = :id', { id })
      .getOne();
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .where('payment.id = :id', { id })
      .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .getOne();

    if (!payment) {
      throw new Error('Payment not found');
    }

    await this.paymentRepository.delete(id);
    return { message: 'Payment deleted successfully' };
  }
} 