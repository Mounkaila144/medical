import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { MedicalHistoryItem } from './medical-history-item.entity';
import { ScannedDocument } from './scanned-document.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

@ObjectType()
@Entity('patients')
export class Patient {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'clinic_id', type: 'uuid' })
  clinicId: string;

  @Field()
  @Column({ unique: true })
  mrn: string;

  @Field()
  @Column({ name: 'first_name' })
  firstName: string;

  @Field()
  @Column({ name: 'last_name' })
  lastName: string;

  @Field()
  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Field()
  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Field({ nullable: true })
  @Column({ name: 'blood_type', nullable: true })
  bloodType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true  })
  address?: any;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => MedicalHistoryItem, (item) => item.patient)
  medicalHistory: MedicalHistoryItem[];

  @OneToMany(() => ScannedDocument, (document) => document.patient)
  documents: ScannedDocument[];

  // Automatically generate an MRN if none is provided
  @BeforeInsert()
  private generateMrn() {
    if (!this.mrn) {
      // Prefix with 'MRN' followed by a random 8-digit number to reduce collision probability
      this.mrn = `MRN${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
  }
} 