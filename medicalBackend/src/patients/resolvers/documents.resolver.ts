import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ScannedDocument } from '../entities/scanned-document.entity';
import { DocumentsService } from '../services/documents.service';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { GqlRolesGuard } from '../../auth/guards/gql-roles.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => ScannedDocument)
@UseGuards(GqlAuthGuard, GqlRolesGuard)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Query(() => [ScannedDocument])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async patientDocuments(
    @Args('patientId') patientId: string,
    @Context() context
  ): Promise<ScannedDocument[]> {
    const { user } = context.req;
    return this.documentsService.list(patientId, user.tenantId);
  }

  @Mutation(() => Boolean)
  @Roles(AuthUserRole.CLINIC_ADMIN)
  async deleteDocument(
    @Args('id') id: string,
    @Context() context
  ): Promise<boolean> {
    const { user } = context.req;
    await this.documentsService.delete(id, user.tenantId);
    return true;
  }
} 