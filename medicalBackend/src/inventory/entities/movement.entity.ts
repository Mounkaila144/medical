import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Item } from './item.entity';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST'
}

registerEnumType(MovementType, {
  name: 'MovementType',
});

@ObjectType()
@Entity()
export class Movement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Item)
  @ManyToOne(() => Item, item => item.movements, { nullable: false })
  item: Item;

  @Field(() => MovementType)
  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Field(() => Number)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  qty: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  reason: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  reference: string;

  @Field(() => Date)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  movedAt: Date;
} 