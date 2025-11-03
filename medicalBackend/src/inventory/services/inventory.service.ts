import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Item } from '../entities/item.entity';
import { Lot } from '../entities/lot.entity';
import { Movement, MovementType } from '../entities/movement.entity';
import { StockLowEvent } from '../events/stock-low.event';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Trouve un article par son ID
   */
  async findItemById(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    return item;
  }

  /**
   * Reçoit un article dans l'inventaire (nouvelle signature compatible avec le contrôleur)
   */
  async receive(
    itemId: string,
    quantity: number,
    lotNumber: string,
    expiry: Date,
    supplierId?: string,
    reference?: string,
  ): Promise<Movement> {
    return this.dataSource.transaction(async manager => {
      const item = await manager.findOne(Item, { where: { id: itemId }, relations: ['lots'] });
      
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      // Chercher si le lot existe déjà
      let lot = await manager.findOne(Lot, { where: { item: { id: itemId }, lotNumber } });
      
      if (lot) {
        // Mettre à jour la quantité existante
        lot.quantity = +lot.quantity + quantity;
        await manager.save(Lot, lot);
      } else {
        // Créer un nouveau lot
        lot = manager.create(Lot, {
          item,
          lotNumber,
          expiry,
          quantity,
        });
        await manager.save(Lot, lot);
      }

      // Enregistrer le mouvement
      const movement = manager.create(Movement, {
        item,
        type: MovementType.IN,
        qty: quantity,
        reference: supplierId || reference,
        reason: 'Réception en stock',
      });
      
      return manager.save(Movement, movement);
    });
  }

  /**
   * Distribue des articles de l'inventaire
   */
  async dispense(
    itemId: string,
    quantity: number,
    reason: string,
    reference?: string,
  ): Promise<Movement> {
    return this.dataSource.transaction(async manager => {
      const item = await manager.findOne(Item, { where: { id: itemId } });
      
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      // Vérifier la disponibilité du stock
      const currentStock = await this.calculateItemStock(itemId);
      
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for item ${item.name}. Available: ${currentStock}, Requested: ${quantity}`);
      }

      // Créer le mouvement de sortie
      const movement = manager.create(Movement, {
        item,
        type: MovementType.OUT,
        qty: quantity,
        reason,
        reference,
      });
      
      await manager.save(Movement, movement);

      // Mettre à jour les lots (FIFO - premier entré, premier sorti)
      let remainingQty = quantity;
      const lots = await manager.find(Lot, { 
        where: { item: { id: itemId } },
        order: { expiry: 'ASC' }
      });

      for (const lot of lots) {
        if (remainingQty <= 0) break;
        
        if (lot.quantity > 0) {
          const qtyToRemove = Math.min(lot.quantity, remainingQty);
          lot.quantity = +lot.quantity - qtyToRemove;
          remainingQty -= qtyToRemove;
          await manager.save(Lot, lot);
        }
      }

      // Vérifier si le stock est bas après la sortie
      const newStock = await this.calculateItemStock(itemId);
      if (newStock <= item.reorderLevel) {
        this.eventEmitter.emit('stock.low', new StockLowEvent(item, newStock));
      }

      return movement;
    });
  }

  /**
   * Ajuste la quantité d'un article dans l'inventaire
   */
  async adjust(
    itemId: string,
    lotId: string,
    newQuantity: number,
    reason: string,
  ): Promise<Movement> {
    return this.dataSource.transaction(async manager => {
      const item = await manager.findOne(Item, { where: { id: itemId } });
      
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      const lot = await manager.findOne(Lot, { where: { id: lotId, item: { id: itemId } } });
      
      if (!lot) {
        throw new NotFoundException(`Lot with ID ${lotId} not found for item ${itemId}`);
      }

      const oldQuantity = +lot.quantity;
      const difference = newQuantity - oldQuantity;
      
      // Créer le mouvement d'ajustement
      const movement = manager.create(Movement, {
        item,
        type: MovementType.ADJUST,
        qty: Math.abs(difference),
        reason: `${reason} (${difference > 0 ? '+' : ''}${difference})`,
      });
      
      await manager.save(Movement, movement);

      // Mettre à jour la quantité du lot
      lot.quantity = newQuantity;
      await manager.save(Lot, lot);

      // Vérifier si le stock est bas après l'ajustement
      const newStock = await this.calculateItemStock(itemId);
      if (newStock <= item.reorderLevel) {
        this.eventEmitter.emit('stock.low', new StockLowEvent(item, newStock));
      }

      return movement;
    });
  }

  /**
   * Liste les articles dont le stock est bas
   */
  async listLow(): Promise<(Item & { currentStock: number })[]> {
    const items = await this.itemRepository.find();
    const lowStockItems: (Item & { currentStock: number })[] = [];

    for (const item of items) {
      const stock = await this.calculateItemStock(item.id);
      if (stock <= item.reorderLevel) {
        lowStockItems.push({
          ...item,
          currentStock: stock,
        });
      }
    }

    return lowStockItems;
  }

  /**
   * Calcule le stock total d'un article
   */
  async calculateItemStock(itemId: string): Promise<number> {
    const lots = await this.lotRepository.find({
      where: { item: { id: itemId } },
    });

    return lots.reduce((total, lot) => total + +lot.quantity, 0);
  }
} 