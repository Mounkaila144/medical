import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
    upload: vi.fn(),
  },
}));

vi.mock('@/types', () => ({
  UserRole: {
    SUPERADMIN: 'SUPERADMIN',
    CLINIC_ADMIN: 'CLINIC_ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    PRACTITIONER: 'PRACTITIONER',
    ACCOUNTANT: 'ACCOUNTANT',
  },
}));

import { PatientService } from '@/services/patient.service';

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPatients()', () => {
    it('normalizes array response into PaginatedResponse', async () => {
      const patients = [
        { id: '1', firstName: 'Jean', lastName: 'Dupont' },
        { id: '2', firstName: 'Marie', lastName: 'Martin' },
      ];
      mockGet.mockResolvedValueOnce(patients);

      const result = await PatientService.getPatients();

      expect(mockGet).toHaveBeenCalledWith('/patients');
      expect(result).toEqual({
        data: patients,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('normalizes paginated response with data array', async () => {
      const paginatedData = {
        data: [{ id: '1', firstName: 'Jean' }],
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      };
      mockGet.mockResolvedValueOnce(paginatedData);

      const result = await PatientService.getPatients({ page: 2, limit: 10 });

      expect(result).toEqual({
        data: paginatedData.data,
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      });
    });

    it('returns empty response for unexpected format', async () => {
      mockGet.mockResolvedValueOnce({ unexpected: 'format' });

      const result = await PatientService.getPatients();

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('builds query string from params', async () => {
      mockGet.mockResolvedValueOnce([]);

      await PatientService.getPatients({ search: 'jean', page: 2, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('search=jean')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
    });

    it('calls /patients without query params when no params provided', async () => {
      mockGet.mockResolvedValueOnce([]);

      await PatientService.getPatients();

      expect(mockGet).toHaveBeenCalledWith('/patients');
    });

    it('includes sortBy and sortOrder in query', async () => {
      mockGet.mockResolvedValueOnce([]);

      await PatientService.getPatients({ sortBy: 'lastName', sortOrder: 'asc' });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=lastName')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=asc')
      );
    });
  });

  describe('searchPatients()', () => {
    it('calls with search param and returns array from array response', async () => {
      const patients = [{ id: '1', firstName: 'Jean' }];
      mockGet.mockResolvedValueOnce(patients);

      const result = await PatientService.searchPatients('Jean');

      expect(mockGet).toHaveBeenCalledWith('/patients?search=Jean');
      expect(result).toEqual(patients);
    });

    it('normalizes paginated response to flat array', async () => {
      const patients = [{ id: '2', firstName: 'Marie' }];
      mockGet.mockResolvedValueOnce({ data: patients });

      const result = await PatientService.searchPatients('Marie');

      expect(result).toEqual(patients);
    });

    it('returns empty array for unexpected format', async () => {
      mockGet.mockResolvedValueOnce({ unexpected: 'data' });

      const result = await PatientService.searchPatients('unknown');

      expect(result).toEqual([]);
    });

    it('encodes search term in URL', async () => {
      mockGet.mockResolvedValueOnce([]);

      await PatientService.searchPatients('Jean-Pierre Côté');

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('search=Jean-Pierre%20C%C3%B4t%C3%A9')
      );
    });
  });

  describe('getPatientById()', () => {
    it('calls GET /patients/:id', async () => {
      const patient = { id: 'abc-123', firstName: 'Jean', lastName: 'Dupont' };
      mockGet.mockResolvedValueOnce(patient);

      const result = await PatientService.getPatientById('abc-123');

      expect(mockGet).toHaveBeenCalledWith('/patients/abc-123');
      expect(result).toEqual(patient);
    });
  });

  describe('createPatient()', () => {
    it('calls POST /patients with patient data', async () => {
      const patientData = {
        firstName: 'Pierre',
        lastName: 'Durand',
        dob: '1990-05-15',
        gender: 'MALE',
        phone: '+227 90 00 00 00',
      } as any;

      const createdPatient = { id: 'new-id', ...patientData };
      mockPost.mockResolvedValueOnce(createdPatient);

      const result = await PatientService.createPatient(patientData);

      expect(mockPost).toHaveBeenCalledWith('/patients', patientData);
      expect(result).toEqual(createdPatient);
    });
  });

  describe('updatePatient()', () => {
    it('calls PUT /patients/:id with partial data', async () => {
      const updateData = { firstName: 'Jean-Pierre' } as any;
      const updatedPatient = { id: 'abc-123', firstName: 'Jean-Pierre', lastName: 'Dupont' };
      mockPut.mockResolvedValueOnce(updatedPatient);

      const result = await PatientService.updatePatient('abc-123', updateData);

      expect(mockPut).toHaveBeenCalledWith('/patients/abc-123', updateData);
      expect(result).toEqual(updatedPatient);
    });
  });

  describe('deletePatient()', () => {
    it('calls DELETE /patients/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await PatientService.deletePatient('abc-123');

      expect(mockDelete).toHaveBeenCalledWith('/patients/abc-123');
    });
  });

  describe('getPatientMedicalHistory()', () => {
    it('returns array from array response', async () => {
      const history = [{ id: '1', type: 'ALLERGY', label: 'Penicillin' }];
      mockGet.mockResolvedValueOnce(history);

      const result = await PatientService.getPatientMedicalHistory('patient-1');

      expect(mockGet).toHaveBeenCalledWith('/patients/medical-history/patient/patient-1');
      expect(result).toEqual(history);
    });

    it('extracts data from paginated response', async () => {
      const history = [{ id: '1', type: 'CONDITION', label: 'Diabetes' }];
      mockGet.mockResolvedValueOnce({ data: history });

      const result = await PatientService.getPatientMedicalHistory('patient-1');

      expect(result).toEqual(history);
    });
  });

  describe('addMedicalHistoryEntry()', () => {
    it('calls POST /patients/medical-history', async () => {
      const entry = { patientId: 'p1', type: 'ALLERGY' as any, label: 'Penicillin' };
      const created = { id: 'mh-1', ...entry };
      mockPost.mockResolvedValueOnce(created);

      const result = await PatientService.addMedicalHistoryEntry(entry);

      expect(mockPost).toHaveBeenCalledWith('/patients/medical-history', entry);
      expect(result).toEqual(created);
    });
  });
});
