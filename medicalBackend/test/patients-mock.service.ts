import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient, Gender } from './mocks/entities/patient.entity';
import { CreatePatientDto } from '../src/patients/dto/create-patient.dto';
import { UpdatePatientDto } from '../src/patients/dto/update-patient.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PatientsMockService {
  private patients: Patient[] = [];

  async create(createPatientDto: CreatePatientDto, tenantId: string): Promise<Patient> {
    const now = new Date();
    
    const newPatient = new Patient({
      id: uuidv4(),
      tenantId: tenantId,
      mrn: createPatientDto.mrn || 'MRN' + Math.floor(Math.random() * 10000),
      firstName: createPatientDto.firstName,
      lastName: createPatientDto.lastName,
      birthDate: (() => {
        if ((createPatientDto as any).age !== undefined) {
          const age = (createPatientDto as any).age;
          const dob = new Date();
          dob.setFullYear(dob.getFullYear() - age);
          return dob;
        }
        return (createPatientDto as any).dob;
      })(),
      gender: createPatientDto.gender || Gender.OTHER,
      bloodType: createPatientDto.bloodType,
      phoneNumber: createPatientDto.phone,
      email: createPatientDto.email,
      address: createPatientDto.address,
      createdAt: now,
      updatedAt: now,
      medicalHistory: [],
      documents: []
    });
    
    this.patients.push(newPatient);
    return newPatient;
  }

  async findAll(tenantId: string): Promise<Patient[]> {
    return this.patients.filter(patient => patient.tenantId === tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<Patient> {
    const patient = this.patients.find(p => p.id === id && p.tenantId === tenantId);
    
    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }
    
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, tenantId: string): Promise<Patient> {
    const patientIndex = this.patients.findIndex(p => p.id === id && p.tenantId === tenantId);
    
    if (patientIndex === -1) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }
    
    const updatedPatient = new Patient({
      ...this.patients[patientIndex],
      ...updatePatientDto,
      tenantId: tenantId,
      birthDate: updatePatientDto.dob || this.patients[patientIndex].birthDate,
      phoneNumber: updatePatientDto.phone || this.patients[patientIndex].phoneNumber,
      updatedAt: new Date()
    });
    
    this.patients[patientIndex] = updatedPatient;
    return updatedPatient;
  }

  async archive(id: string, tenantId: string): Promise<void> {
    const patientIndex = this.patients.findIndex(p => p.id === id && p.tenantId === tenantId);
    
    if (patientIndex === -1) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }
    
    this.patients.splice(patientIndex, 1);
  }

  async search(params: any): Promise<Patient[]> {
    const { clinicId, search, ...filters } = params;
    
    return this.patients.filter(patient => {
      if (patient.tenantId !== clinicId) {
        return false;
      }
      
      if (search && 
         !(patient.firstName.includes(search) || 
           patient.lastName.includes(search) || 
           patient.email?.includes(search))) {
        return false;
      }
      
      for (const [key, value] of Object.entries(filters)) {
        if (value && patient[key] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }
} 