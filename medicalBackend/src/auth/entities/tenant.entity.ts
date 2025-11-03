import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Field()
  slug: string;

  @Column({ type: 'boolean', default: true })
  @Field()
  isActive: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @OneToMany(() => User, user => user.tenant)
  @Field(() => [User], { nullable: true })
  users: User[];
}