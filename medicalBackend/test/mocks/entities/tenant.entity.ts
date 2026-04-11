import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  subdomain: string;

  @Column({ name: 'logo_url', nullable: true })
  @Field({ nullable: true })
  logoUrl: string;

  @Column({ name: 'is_active', default: true })
  @Field()
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  updatedAt: Date;
} 