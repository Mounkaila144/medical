import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../../services/inventory.service';
import { Item, ItemCategory, ItemUnit } from '../../entities/item.entity';
import { Lot } from '../../entities/lot.entity';
import { Movement, MovementType } from '../../entities/movement.entity';
import { StockLowEvent } from '../../events/stock-low.event';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Créer un mock plus simple pour DataSource
const mockDataSource = () => ({
  transaction: jest.fn().mockImplementation((cb) => {
    const mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    return Promise.resolve(cb(mockEntityManager));
  }),
});

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('InventoryService', () => {
  let service: InventoryService;
  let itemRepository: Repository<Item>;
  let lotRepository: Repository<Lot>;
  let movementRepository: Repository<Movement>;
  let dataSource: any; // Utiliser any pour éviter les problèmes de typage
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Item),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Lot),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Movement),
          useFactory: mockRepository,
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));
    lotRepository = module.get<Repository<Lot>>(getRepositoryToken(Lot));
    movementRepository = module.get<Repository<Movement>>(getRepositoryToken(Movement));
    dataSource = module.get(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateItemStock', () => {
    it('should calculate the total stock for an item', async () => {
      const itemId = 'test-item-id';
      const mockLots = [
        { quantity: 10 },
        { quantity: 15 },
        { quantity: 5 },
      ];

      jest.spyOn(lotRepository, 'find').mockResolvedValue(mockLots as Lot[]);

      const result = await service.calculateItemStock(itemId);
      
      expect(lotRepository.find).toHaveBeenCalledWith({
        where: { item: { id: itemId } },
      });
      expect(result).toBe(30); // 10 + 15 + 5
    });

    it('should return 0 if no lots found', async () => {
      const itemId = 'test-item-id';
      
      jest.spyOn(lotRepository, 'find').mockResolvedValue([]);

      const result = await service.calculateItemStock(itemId);
      
      expect(result).toBe(0);
    });
  });

  describe('listLow', () => {
    it('should return items with stock below reorder level', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Item 1', reorderLevel: 10 },
        { id: 'item-2', name: 'Item 2', reorderLevel: 20 },
        { id: 'item-3', name: 'Item 3', reorderLevel: 5 },
      ];

      jest.spyOn(itemRepository, 'find').mockResolvedValue(mockItems as Item[]);
      
      // Mock calculateItemStock to simulate different stock levels
      jest.spyOn(service, 'calculateItemStock').mockImplementation(async (itemId) => {
        const stockLevels = {
          'item-1': 5,  // Below reorder level (10)
          'item-2': 25, // Above reorder level (20)
          'item-3': 2,  // Below reorder level (5)
        };
        return stockLevels[itemId];
      });

      const result = await service.listLow();
      
      expect(itemRepository.find).toHaveBeenCalled();
      expect(service.calculateItemStock).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-3');
      // Utiliser any pour accéder à currentStock
      expect((result[0] as any).currentStock).toBe(5);
      expect((result[1] as any).currentStock).toBe(2);
    });
  });

  describe('dispense', () => {
    it('should emit stock low event when stock falls below reorder level', async () => {
      const mockItem = {
        id: 'item-id',
        name: 'Test Item',
        reorderLevel: 10,
      };

      // Configurer directement le mock de DataSource.transaction
      dataSource.transaction.mockImplementationOnce((cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockItem),
          find: jest.fn().mockResolvedValue([
            { id: 'lot-1', quantity: 15, expiry: new Date() }
          ]),
          create: jest.fn().mockReturnValue({ id: 'movement-id' }),
          save: jest.fn().mockResolvedValue({ id: 'saved-id' })
        };
        return Promise.resolve(cb(mockManager));
      });
      
      // Mock calculateItemStock to return a value below reorder level after dispense
      jest.spyOn(service, 'calculateItemStock')
        .mockResolvedValueOnce(15) // First call: check if enough stock
        .mockResolvedValueOnce(8);  // Second call: stock after dispense, below reorder level

      await service.dispense('item-id', 7, 'Test reason');
      
      // Vérifier que l'événement stock.low a été émis
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'stock.low',
        expect.any(StockLowEvent)
      );
      
      const eventArg = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(eventArg.item).toEqual(mockItem);
      expect(eventArg.currentStock).toBe(8);
    });
  });
}); 