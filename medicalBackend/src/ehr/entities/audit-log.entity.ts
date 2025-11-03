import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { GraphQLJSON } from 'graphql-type-json';

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

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  before: Record<string, any>;

  @Column('json')
  @Field(() => GraphQLJSON)
  after: Record<string, any>;

  @Column({ name: 'changed_at' })
  @Field()
  changedAt: Date;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  details: any;

  @Column('json')
  @Field(() => GraphQLJSON)
  changes: any;
} 