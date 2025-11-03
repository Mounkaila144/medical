import { Patient } from '../entities/patient.entity';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
export declare class PatientsResolver {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    createPatient(createPatientDto: CreatePatientDto, context: any): Promise<Patient>;
    patients(context: any): Promise<Patient[]>;
    patient(id: string, context: any): Promise<Patient>;
    searchPatients(searchParams: SearchPatientDto, context: any): Promise<Patient[]>;
    updatePatient(id: string, updatePatientDto: UpdatePatientDto, context: any): Promise<Patient>;
    archivePatient(id: string, context: any): Promise<boolean>;
}
