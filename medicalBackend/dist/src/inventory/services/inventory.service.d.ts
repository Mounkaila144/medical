import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { Item } from '../entities/item.entity';
import { Lot } from '../entities/lot.entity';
import { Movement } from '../entities/movement.entity';
export declare class InventoryService {
    private itemRepository;
    private lotRepository;
    private movementRepository;
    private dataSource;
    private eventEmitter;
    constructor(itemRepository: Repository<Item>, lotRepository: Repository<Lot>, movementRepository: Repository<Movement>, dataSource: DataSource, eventEmitter: EventEmitter2);
    findItemById(id: string): Promise<Item>;
    receive(itemId: string, quantity: number, lotNumber: string, expiry: Date, supplierId?: string, reference?: string): Promise<Movement>;
    dispense(itemId: string, quantity: number, reason: string, reference?: string): Promise<Movement>;
    adjust(itemId: string, lotId: string, newQuantity: number, reason: string): Promise<Movement>;
    listLow(): Promise<(Item & {
        currentStock: number;
    })[]>;
    calculateItemStock(itemId: string): Promise<number>;
}
