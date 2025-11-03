import { Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { ScannedDocument } from '../entities/scanned-document.entity';
import { Express } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Controller('patients/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req
  ): Promise<ScannedDocument> {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été téléchargé');
    }
    
    // Traitement manuel des tags si c'est une chaîne
    if (createDocumentDto.tags && typeof createDocumentDto.tags === 'string') {
      createDocumentDto.tags = (createDocumentDto.tags as any)
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }
    
    const tenantId = req.user.tenantId;
    return this.documentsService.upload(file, createDocumentDto, tenantId);
  }

  @Get('patient/:patientId')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async listByPatient(
    @Param('patientId') patientId: string,
    @Req() req
  ): Promise<ScannedDocument[]> {
    const tenantId = req.user.tenantId;
    return this.documentsService.list(patientId, tenantId);
  }

  @Delete(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN)
  async remove(
    @Param('id') id: string,
    @Req() req
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    return this.documentsService.delete(id, tenantId);
  }
} 