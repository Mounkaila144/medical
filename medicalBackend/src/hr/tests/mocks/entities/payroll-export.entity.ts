import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Tenant } from './tenant.entity';

@ObjectType()
@Entity('payroll_export')
export class PayrollExport {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  tenantId: string;

  @Field(() => Tenant)
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Field()
  @Column({ type: 'varchar', length: 10 })
  period: string;

  @Field()
  @Column({ type: 'varchar' })
  filePath: string;

  @Field()
  @Column({ type: 'timestamp' })
  generatedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 