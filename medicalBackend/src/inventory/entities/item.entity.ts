import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Tenant } from '../../auth/entities/tenant.entity';
import { Lot } from './lot.entity';
import { Movement } from './movement.entity';

export enum ItemCategory {
  DRUG = 'DRUG',
  CONSUMABLE = 'CONSUMABLE'
}

export enum ItemUnit {
  BOX = 'BOX',
  PIECE = 'PIECE',
  ML = 'ML'
}

registerEnumType(ItemCategory, {
  name: 'ItemCategory',
});

registerEnumType(ItemUnit, {
  name: 'ItemUnit',
});

@ObjectType()
@Entity()
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @Field(() => String)
  @Column()
  @Index({ unique: true })
  sku: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => ItemCategory)
  @Column({
    type: 'enum',
    enum: ItemCategory,
  })
  category: ItemCategory;

  @Field(() => ItemUnit)
  @Column({
    type: 'enum',
    enum: ItemUnit,
  })
  unit: ItemUnit;

  @Field(() => Number)
  @Column({ type: 'int' })
  reorderLevel: number;

  @OneToMany(() => Lot, lot => lot.item)
  lots: Lot[];

  @OneToMany(() => Movement, movement => movement.item)
  movements: Movement[];
} 