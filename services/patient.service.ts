import { apiClient } from '@/lib/api';
import { Patient, PatientForm, PaginatedResponse, MedicalHistory, MedicalHistoryType } from '@/types';

export interface PatientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  clinicId?: string;
}

export interface DocumentUploadData {
  patientId: string;
  docType: string;
  uploadedBy: string;
  tags?: string;
}

export class PatientService {
  static async getPatients(params: PatientSearchParams = {}): Promise<PaginatedResponse<Patient>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.clinicId) queryParams.append('clinicId', params.clinicId);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/patients?${queryString}` : '/patients';

    const result = await apiClient.get<any>(endpoint);

    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(result.length / (params.limit || 10))
      };
    } else if (result.data && Array.isArray(result.data)) {
      return {
        data: result.data,
        total: result.total || result.data.length,
        page: result.page || params.page || 1,
        limit: result.limit || params.limit || 10,
        totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10))
      };
    }

    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0
    };
  }

  static async searchPatients(searchTerm: string): Promise<Patient[]> {
    const result = await apiClient.get<any>(`/patients?search=${encodeURIComponent(searchTerm)}`);
    if (Array.isArray(result)) return result;
    if (result.data && Array.isArray(result.data)) return result.data;
    return [];
  }

  static async getPatientById(id: string): Promise<Patient> {
    return apiClient.get<Patient>(`/patients/${id}`);
  }

  static async createPatient(patientData: PatientForm): Promise<Patient> {
    return apiClient.post<Patient>('/patients', patientData);
  }

  static async updatePatient(id: string, patientData: Partial<PatientForm>): Promise<Patient> {
    return apiClient.put<Patient>(`/patients/${id}`, patientData);
  }

  static async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  }

  static async uploadDocument(file: File, data: DocumentUploadData): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', data.patientId);
    formData.append('docType', data.docType);
    formData.append('uploadedBy', data.uploadedBy);
    if (data.tags) {
      formData.append('tags', data.tags);
    }

    return apiClient.upload<any>('/patients/documents/upload', formData);
  }

  static async getPatientDocuments(patientId: string): Promise<any[]> {
    const result = await apiClient.get<any>(`/patients/documents/patient/${patientId}`);
    return Array.isArray(result) ? result : (result.data || []);
  }

  static async getPatientMedicalHistory(patientId: string): Promise<MedicalHistory[]> {
    const result = await apiClient.get<any>(`/patients/medical-history/patient/${patientId}`);
    return Array.isArray(result) ? result : (result.data || []);
  }

  static async addMedicalHistoryEntry(data: {
    patientId: string;
    type: MedicalHistoryType;
    label: string;
    note?: string;
  }): Promise<MedicalHistory> {
    return apiClient.post<MedicalHistory>('/patients/medical-history', data);
  }

  static async updateMedicalHistoryEntry(id: string, data: Partial<MedicalHistory>): Promise<MedicalHistory> {
    return apiClient.put<MedicalHistory>(`/patients/medical-history/${id}`, data);
  }

  static async deleteMedicalHistoryEntry(id: string): Promise<void> {
    await apiClient.delete(`/patients/medical-history/${id}`);
  }

  static async getPatientStats(): Promise<{
    total: number;
    newThisMonth: number;
    byGender: Record<string, number>;
    byAgeGroup: Record<string, number>;
  }> {
    return apiClient.get('/patients/stats');
  }

  static async exportPatients(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    return apiClient.get<Blob>(`/patients/export?format=${format}`);
  }
}
