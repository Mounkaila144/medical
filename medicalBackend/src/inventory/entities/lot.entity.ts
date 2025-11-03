import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Item } from './item.entity';

@ObjectType()
@Entity()
export class Lot {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Item)
  @ManyToOne(() => Item, item => item.lots, { nullable: false })
  item: Item;

  @Field(() => String)
  @Column()
  lotNumber: string;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  expiry: Date;

  @Field(() => Number)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;
} 