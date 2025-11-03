import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InvoicingService } from '../services/invoicing.service';
import { CreateInvoiceDto, AddInvoiceLineDto, UpdateInvoiceStatusDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly invoicingService: InvoicingService,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async createDraft(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
    return this.invoicingService.createDraft(req.user.tenantId, createInvoiceDto);
  }

  @Post('line')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async addLine(@Body() addLineDto: AddInvoiceLineDto, @Req() req) {
    return this.invoicingService.addLine(req.user.tenantId, addLineDto);
  }

  @Post(':id/send')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async sendInvoice(@Param('id') id: string, @Body() data: any, @Req() req) {
    return this.invoicingService.send(req.user.tenantId, {
      invoiceId: id,
      status: InvoiceStatus.SENT
    });
  }

  @Post('send')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async send(@Body() updateStatusDto: UpdateInvoiceStatusDto, @Req() req) {
    return this.invoicingService.send(req.user.tenantId, updateStatusDto);
  }

  @Post('mark-paid')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async markPaid(@Body() updateStatusDto: UpdateInvoiceStatusDto, @Req() req) {
    return this.invoicingService.markPaid(req.user.tenantId, updateStatusDto);
  }

  @Post('remind-overdue')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async remindOverdue(@Req() req) {
    return this.invoicingService.remindOverdue(req.user.tenantId);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findAll(
    @Req() req,
    @Query('patientId') patientId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    const where: any = { tenantId: req.user.tenantId };

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    return this.invoiceRepository.find({
      where,
      relations: ['patient', 'lines', 'payments'],
      order: { issueDate: 'DESC' },
    });
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.invoiceRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
      relations: ['patient', 'lines', 'payments'],
    });
  }

  @Patch(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async update(@Param('id') id: string, @Body() updateInvoiceDto: Partial<CreateInvoiceDto>, @Req() req) {
    await this.invoiceRepository.update(
      { id, tenantId: req.user.tenantId },
      updateInvoiceDto,
    );
    return this.invoiceRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
      relations: ['patient', 'lines', 'payments'],
    });
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    await this.invoiceRepository.delete({
      id,
      tenantId: req.user.tenantId,
    });
    return { message: 'Invoice deleted successfully' };
  }

  @Get(':id/download/pdf')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async downloadPdf(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response
  ) {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id, tenantId: req.user.tenantId },
      });

      if (!invoice) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Invoice not found',
        });
      }

      const pdfBuffer = await this.invoicingService.downloadPdf(id, req.user.tenantId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${invoice.number}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error downloading PDF',
        error: error.message,
      });
    }
  }

  @Post(':id/regenerate-pdf')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async regeneratePdf(@Param('id') id: string, @Req() req) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });

    if (!invoice) {
      return { message: 'Invoice not found' };
    }

    await this.invoicingService.generatePdf(id, req.user.tenantId);
    return { message: 'PDF generated successfully' };
  }
} 