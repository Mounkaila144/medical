import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  @Field()
  table: string;

  @Column()
  @Field()
  column: string;

  // SQLite ne supporte pas JSONB - utiliser TEXT stocké en JSON
  @Column('simple-json', { nullable: true })
  @Field({ nullable: true })
  before: Record<string, any>;

  @Column('simple-json')
  @Field()
  after: Record<string, any>;

  @Column({ name: 'changed_at' })
  @Field()
  changedAt: Date;
} 