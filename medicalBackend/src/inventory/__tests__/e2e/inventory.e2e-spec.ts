import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { InventoryTestModule } from './inventory-test.module';
import { Item, ItemCategory, ItemUnit } from '../../entities/item.entity';
import { Lot } from '../../entities/lot.entity';
import { Movement, MovementType } from '../../entities/movement.entity';
import { Supplier } from '../../entities/supplier.entity';

describe('Inventory Management (e2e)', () => {
  let app: INestApplication;
  let itemRepository: Repository<Item>;
  let lotRepository: Repository<Lot>;
  let movementRepository: Repository<Movement>;
  let supplierRepository: Repository<Supplier>;
  let jwtService: JwtService;
  
  let testItem: Item;
  let testLot: Lot;
  let testSupplier: Supplier;
  
  const testTenantId = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [InventoryTestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      itemRepository = moduleFixture.get(getRepositoryToken(Item));
      lotRepository = moduleFixture.get(getRepositoryToken(Lot));
      movementRepository = moduleFixture.get(getRepositoryToken(Movement));
      supplierRepository = moduleFixture.get(getRepositoryToken(Supplier));
      jwtService = moduleFixture.get(JwtService);

      // Créer un tenant fictif pour les tests
      const testTenant = { id: testTenantId, name: 'Test Clinic' };

      // Créer un fournisseur pour les tests
      testSupplier = await supplierRepository.save({
        id: uuidv4(),
        tenant: testTenant,
        name: 'Test Supplier',
        contact: {
          email: 'supplier@example.com',
          phone: '+1234567890',
          address: '123 Supplier St'
        }
      } as any);
      
      console.log('Fournisseur créé avec ID:', testSupplier.id);

      // Créer un article pour les tests
      testItem = await itemRepository.save({
        id: uuidv4(),
        tenant: testTenant,
        sku: 'TEST-001',
        name: 'Test Item',
        category: ItemCategory.DRUG,
        unit: ItemUnit.BOX,
        reorderLevel: 10
      } as any);
      
      console.log('Article créé avec ID:', testItem.id);

      // Créer un lot pour les tests
      testLot = await lotRepository.save({
        id: uuidv4(),
        item: testItem,
        lotNumber: 'LOT-001',
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
        quantity: 20
      } as any);
      
      console.log('Lot créé avec ID:', testLot.id);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    try {
      // Nettoyage
      await movementRepository.delete({});
      await lotRepository.delete({ id: testLot.id });
      await itemRepository.delete({ id: testItem.id });
      await supplierRepository.delete({ id: testSupplier.id });
    } catch (error) {
      console.error('Erreur lors du nettoyage des tests:', error);
    } finally {
      if (app) {
        await app.close();
      }
      console.log('Tests terminés, ressources nettoyées');
    }
  });

  it('should get inventory item details', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const response = await request(app.getHttpServer())
      .get(`/inventory/items/${testItem.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(testItem.id);
    expect(response.body.name).toBe(testItem.name);
    expect(response.body.sku).toBe(testItem.sku);
  });

  it('should create a new movement when dispensing items', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const response = await request(app.getHttpServer())
      .post(`/inventory/dispense`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: testItem.id,
        quantity: 5,
        reason: 'Test dispense'
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    
    // Vérifier que le mouvement a été créé
    const movements = await movementRepository.find({
      where: { 
        item: { id: testItem.id },
        type: MovementType.OUT
      } as any
    });
    
    expect(movements.length).toBeGreaterThan(0);
    
    // Vérifier que le lot a été mis à jour
    const updatedLot = await lotRepository.findOne({
      where: { id: testLot.id } as any
    });
    
    expect(updatedLot).toBeDefined();
    if (updatedLot) {
      expect(updatedLot.quantity).toBe(15); // 20 - 5
    }
  });

  it('should list low stock items', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    // Mettre à jour le lot pour avoir un stock bas
    await lotRepository.update(testLot.id, { quantity: 8 });
    
    const response = await request(app.getHttpServer())
      .get('/inventory/items/low')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    
    // Vérifier que notre article est dans la liste des stocks bas
    const lowStockItem = response.body.find((item: any) => item.id === testItem.id);
    expect(lowStockItem).toBeDefined();
    expect(lowStockItem.currentStock).toBeLessThan(lowStockItem.reorderLevel);
  });

  it('should receive inventory from supplier', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const response = await request(app.getHttpServer())
      .post('/inventory/receive')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: testItem.id,
        quantity: 15,
        lotNumber: 'LOT-002',
        expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Dans 60 jours
        supplierId: testSupplier.id
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    
    // Vérifier qu'un nouveau lot a été créé
    const lots = await lotRepository.find({
      where: { 
        item: { id: testItem.id },
        lotNumber: 'LOT-002'
      } as any
    });
    
    expect(lots.length).toBe(1);
    expect(lots[0].quantity).toBe(15);
    
    // Vérifier que le mouvement a été créé
    const movements = await movementRepository.find({
      where: { 
        item: { id: testItem.id },
        type: MovementType.IN
      } as any
    });
    
    expect(movements.length).toBeGreaterThan(0);
  });
}); 