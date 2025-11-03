import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory, ExpenseStatus, PaymentStatus } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async create(@Body() createExpenseDto: CreateExpenseDto, @Req() req) {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      tenantId: req.user.tenantId,
    });
    return this.expenseRepository.save(expense);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findAll(
    @Req() req,
    @Query('category') category?: ExpenseCategory,
    @Query('status') status?: ExpenseStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .orderBy('expense.expenseDate', 'DESC');

    if (category) {
      queryBuilder.andWhere('expense.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('expense.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (startDate) {
      queryBuilder.andWhere('expense.expenseDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('expense.expenseDate <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
  }

  @Get('stats')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async getStats(@Req() req) {
    const totalExpenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('expense.status != :status', { status: ExpenseStatus.CANCELLED })
      .getRawOne();

    const paidExpenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
      .getRawOne();

    const pendingExpenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.UNPAID })
      .getRawOne();

    const byCategory = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('expense.status != :status', { status: ExpenseStatus.CANCELLED })
      .groupBy('expense.category')
      .getRawMany();

    return {
      totalExpenses: parseFloat(totalExpenses?.total || '0'),
      paidExpenses: parseFloat(paidExpenses?.total || '0'),
      pendingExpenses: parseFloat(pendingExpenses?.total || '0'),
      byCategory,
    };
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.expenseRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Patch(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async update(@Param('id') id: string, @Body() updateExpenseDto: Partial<CreateExpenseDto>, @Req() req) {
    await this.expenseRepository.update(
      { id, tenantId: req.user.tenantId },
      updateExpenseDto,
    );
    return this.expenseRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    await this.expenseRepository.delete({
      id,
      tenantId: req.user.tenantId,
    });
    return { message: 'Expense deleted successfully' };
  }
}
