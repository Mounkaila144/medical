import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { SupplierService } from '../services/supplier.service';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierInput, UpdateSupplierInput } from '../dto/supplier.dto';

@Resolver(() => Supplier)
@UseGuards(JwtAuthGuard)
export class SupplierResolver {
  constructor(private supplierService: SupplierService) {}

  @Query(() => [Supplier])
  async suppliers(@CurrentUser() user: User) {
    return this.supplierService.list(user.tenant.id);
  }

  @Mutation(() => Supplier)
  async createSupplier(
    @Args('input') input: CreateSupplierInput,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.create(
      input.name,
      input.contact,
      user.tenant,
    );
  }
} 