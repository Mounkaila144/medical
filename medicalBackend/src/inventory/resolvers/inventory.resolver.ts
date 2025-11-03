import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../entities/item.entity';
import { Movement } from '../entities/movement.entity';
import { ReceiveItemInput, DispenseItemInput, AdjustItemInput } from '../dto/movement.dto';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class InventoryResolver {
  constructor(private inventoryService: InventoryService) {}

  @Query(() => [Item])
  async lowStockItems(@CurrentUser() user: User) {
    return this.inventoryService.listLow();
  }

  @Mutation(() => Movement)
  async receiveItem(
    @Args('input') input: ReceiveItemInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.receive(
      input.itemId,
      input.quantity,
      input.lotNumber,
      input.expiry,
      input.reference,
    );
  }

  @Mutation(() => Movement)
  async dispenseItem(
    @Args('input') input: DispenseItemInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.dispense(
      input.itemId,
      input.quantity,
      input.reason,
      input.reference,
    );
  }

  @Mutation(() => Movement)
  async adjustItem(
    @Args('input') input: AdjustItemInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.adjust(
      input.itemId,
      input.lotId,
      input.newQuantity,
      input.reason,
    );
  }
} 