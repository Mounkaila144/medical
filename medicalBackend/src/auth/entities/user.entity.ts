import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Session } from './session.entity';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum AuthUserRole {
  SUPERADMIN = 'SUPERADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  PRACTITIONER = 'PRACTITIONER',
}

registerEnumType(AuthUserRole, {
  name: 'AuthUserRole',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, tenant => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Field(() => AuthUserRole)
  @Column({ type: 'varchar', length: 50, default: AuthUserRole.EMPLOYEE })
  role: AuthUserRole;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Session], { nullable: true })
  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
} 