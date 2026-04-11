import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum AuthUserRole {
  SUPERADMIN = 'SUPERADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

registerEnumType(AuthUserRole, {
  name: 'AuthUserRole',
});

@ObjectType()
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name' })
  @Field()
  firstName: string;

  @Column({ name: 'last_name' })
  @Field()
  lastName: string;

  @Column({
    type: 'simple-enum',
    enum: AuthUserRole,
    default: AuthUserRole.EMPLOYEE,
  })
  @Field(() => AuthUserRole)
  role: AuthUserRole;

  @Column({ name: 'tenant_id', nullable: true })
  @Field({ nullable: true })
  tenantId: string;

  @Column({ name: 'is_active', default: true })
  @Field()
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;
} 