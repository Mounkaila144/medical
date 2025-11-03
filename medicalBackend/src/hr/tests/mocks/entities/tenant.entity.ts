import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('tenant')
export class Tenant {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 