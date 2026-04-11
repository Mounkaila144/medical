import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MedicalHistoryItem } from './medical-history-item.entity';
import { ScannedDocument } from './scanned-document.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

@ObjectType()
@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'clinic_id', nullable: true })
  @Field({ nullable: true })
  clinicId: string;

  // Alias pour la compatibilité avec les tests EHR
  get tenantId(): string {
    return this.clinicId;
  }
  
  set tenantId(value: string) {
    this.clinicId = value;
  }

  constructor(partial?: Partial<Patient>) {
    if (partial) {
      Object.assign(this, partial);
      // S'assurer que tenantId est correctement assigné à clinicId
      if (partial.tenantId) {
        this.clinicId = partial.tenantId;
      }
    }
  }

  @Column({ nullable: true })
  @Field({ nullable: true })
  mrn?: string;

  @Column()
  @Field()
  firstName: string;

  @Column()
  @Field()
  lastName: string;

  @Column({ nullable: true, name: 'dob' })
  @Field({ nullable: true })
  dob?: Date;

  // Alias pour la compatibilité avec les tests EHR
  get birthDate(): Date | undefined {
    return this.dob;
  }
  
  set birthDate(value: Date | undefined) {
    this.dob = value;
  }

  @Column({
    type: 'simple-enum',
    enum: Gender,
    default: Gender.OTHER,
    nullable: true
  })
  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bloodType?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  // Alias pour la compatibilité avec les tests EHR
  get phoneNumber(): string | undefined {
    return this.phone;
  }
  
  set phoneNumber(value: string | undefined) {
    this.phone = value;
  }

  @Column({ nullable: true })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true, type: 'simple-json' })
  @Field({ nullable: true })
  address?: any;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  updatedAt: Date;

  @OneToMany(() => MedicalHistoryItem, (item) => item.patient)
  @Field(() => [MedicalHistoryItem], { nullable: true })
  medicalHistory: MedicalHistoryItem[];

  @OneToMany(() => ScannedDocument, (doc) => doc.patient)
  @Field(() => [ScannedDocument], { nullable: true })
  documents: ScannedDocument[];
} 