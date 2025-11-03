import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('wait_queue_entries')
export class WaitQueueEntry {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Field()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Field(() => Int)
  @Column()
  rank: number;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'text' }) // SQLite utilise text au lieu de timestamp
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'served_at', type: 'text', nullable: true }) // SQLite utilise text au lieu de timestamp
  servedAt: Date;
} 