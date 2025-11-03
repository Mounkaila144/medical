import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum TariffCategory {
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  LABORATORY = 'LABORATORY',
  IMAGING = 'IMAGING',
  MEDICATION = 'MEDICATION',
  OTHER = 'OTHER',
}

registerEnumType(TariffCategory, {
  name: 'TariffCategory',
});

@ObjectType()
@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @Column({ unique: true })
  @Field()
  code: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TariffCategory,
    default: TariffCategory.CONSULTATION,
  })
  @Field(() => TariffCategory)
  category: TariffCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field({ nullable: true })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field()
  price: number;

  @Column({ default: 'XOF' })
  @Field()
  currency: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  duration: number;

  @Column({ name: 'is_active', default: true })
  @Field()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;
} 