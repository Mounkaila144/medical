import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { StockLowEvent } from '../../events/stock-low.event';
import { ItemCategory, ItemUnit } from '../../entities/item.entity';
import { MovementType } from '../../entities/movement.entity';

describe('Stock Low Event Test', () => {
  let eventEmitter: EventEmitter2;
  let lowStockHandler: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
    }).compile();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    lowStockHandler = jest.fn();
    eventEmitter.on('stock.low', lowStockHandler);
  });

  it('should emit and receive stock.low event', () => {
    // Créer un mock item
    const item = {
      id: 'test-item-id',
      sku: 'TEST-001',
      name: 'Test Item',
      category: ItemCategory.DRUG,
      unit: ItemUnit.BOX,
      reorderLevel: 10,
    };

    // Émettre l'événement
    const currentStock = 5;
    eventEmitter.emit('stock.low', new StockLowEvent(item, currentStock));

    // Vérifier que le gestionnaire d'événements a été appelé
    expect(lowStockHandler).toHaveBeenCalled();
    
    const eventArg = lowStockHandler.mock.calls[0][0];
    expect(eventArg).toBeInstanceOf(StockLowEvent);
    expect(eventArg.item.id).toBe('test-item-id');
    expect(eventArg.currentStock).toBe(5);
  });

  // Test qui simule la logique du service d'inventaire
  it('should trigger stock low event when stock goes below threshold', () => {
    // Créer un mock item
    const item = {
      id: 'test-item-id',
      sku: 'TEST-001',
      name: 'Test Item',
      category: ItemCategory.DRUG,
      unit: ItemUnit.BOX,
      reorderLevel: 10,
    };

    // Simuler un mouvement de stock sortant
    const initialStock = 15;
    const quantityToDispense = 10;
    const newStock = initialStock - quantityToDispense;

    // Vérifier si le stock est bas et émettre l'événement si nécessaire
    if (newStock <= item.reorderLevel) {
      eventEmitter.emit('stock.low', new StockLowEvent(item, newStock));
    }

    // Vérifier que l'événement a été émis avec les bonnes valeurs
    expect(lowStockHandler).toHaveBeenCalled();
    const eventArg = lowStockHandler.mock.calls[0][0];
    expect(eventArg.item.id).toBe('test-item-id');
    expect(eventArg.currentStock).toBe(5);
  });
}); 