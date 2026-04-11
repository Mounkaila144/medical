import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    patch: (...args: any[]) => mockPatch(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
  createQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },
}));

vi.mock('@/types', () => ({
  AppointmentStatus: {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
  },
  Priority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
}));

import { AppointmentService } from '@/services/appointment.service';

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppointment()', () => {
    it('calls POST /appointments with appointment data', async () => {
      const appointmentData = {
        patientId: 'patient-1',
        practitionerId: 'pract-1',
        startAt: '2026-04-15T10:00:00Z',
        endAt: '2026-04-15T10:30:00Z',
        reason: 'Consultation generale',
        urgency: 'ROUTINE',
      } as any;

      const createdAppointment = { id: 'apt-1', ...appointmentData, status: 'SCHEDULED' };
      mockPost.mockResolvedValueOnce(createdAppointment);

      const result = await AppointmentService.createAppointment(appointmentData);

      expect(mockPost).toHaveBeenCalledWith('/appointments', appointmentData);
      expect(result).toEqual(createdAppointment);
    });

    it('throws error with API message on failure', async () => {
      const appointmentData = { patientId: 'p1', practitionerId: 'pr1' } as any;
      mockPost.mockRejectedValueOnce({
        data: { message: 'Time slot not available' },
        message: 'Request failed',
      });

      await expect(AppointmentService.createAppointment(appointmentData))
        .rejects.toThrow('Time slot not available');
    });
  });

  describe('getAppointments()', () => {
    it('calls GET /appointments without params', async () => {
      const appointments = [
        { id: 'apt-1', reason: 'Consultation' },
        { id: 'apt-2', reason: 'Suivi' },
      ];
      mockGet.mockResolvedValueOnce(appointments);

      const result = await AppointmentService.getAppointments();

      expect(mockGet).toHaveBeenCalledWith('/appointments');
      expect(result.data).toEqual(appointments);
      expect(result.total).toBe(2);
    });

    it('calls GET with query params', async () => {
      mockGet.mockResolvedValueOnce([]);

      await AppointmentService.getAppointments({
        date: '2026-04-15',
        status: 'SCHEDULED',
        page: 1,
        limit: 20,
      });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('date=2026-04-15');
      expect(calledUrl).toContain('status=SCHEDULED');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=20');
    });

    it('normalizes array response into PaginatedResponse', async () => {
      const appointments = [{ id: '1' }, { id: '2' }, { id: '3' }];
      mockGet.mockResolvedValueOnce(appointments);

      const result = await AppointmentService.getAppointments({ limit: 2 });

      expect(result).toEqual({
        data: appointments,
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });

    it('normalizes paginated response with data field', async () => {
      const paginatedResponse = {
        data: [{ id: '1' }],
        total: 10,
        page: 2,
        limit: 5,
        totalPages: 2,
      };
      mockGet.mockResolvedValueOnce(paginatedResponse);

      const result = await AppointmentService.getAppointments({ page: 2, limit: 5 });

      expect(result.data).toEqual([{ id: '1' }]);
      expect(result.total).toBe(10);
    });

    it('normalizes Spring-style paginated response with content field', async () => {
      const springResponse = {
        content: [{ id: '1' }],
        totalElements: 25,
        number: 0,
        size: 10,
        totalPages: 3,
      };
      mockGet.mockResolvedValueOnce(springResponse);

      const result = await AppointmentService.getAppointments();

      expect(result.data).toEqual([{ id: '1' }]);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
    });

    it('returns empty result for unexpected format', async () => {
      mockGet.mockResolvedValueOnce({ unexpected: 'format' });

      const result = await AppointmentService.getAppointments();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getAppointmentById()', () => {
    it('calls GET /appointments/:id', async () => {
      const appointment = { id: 'apt-1', reason: 'Consultation', status: 'SCHEDULED' };
      mockGet.mockResolvedValueOnce(appointment);

      const result = await AppointmentService.getAppointmentById('apt-1');

      expect(mockGet).toHaveBeenCalledWith('/appointments/apt-1');
      expect(result).toEqual(appointment);
    });

    it('throws error on failure', async () => {
      mockGet.mockRejectedValueOnce({ message: 'Not found' });

      await expect(AppointmentService.getAppointmentById('nonexistent'))
        .rejects.toThrow();
    });
  });

  describe('cancelAppointment()', () => {
    it('calls PATCH /appointments/:id/cancel with cancellation data', async () => {
      const cancelData = {
        cancellationReason: 'Patient request',
        notifyPatient: true,
      };
      const cancelledAppointment = { id: 'apt-1', status: 'CANCELLED' };
      mockPatch.mockResolvedValueOnce(cancelledAppointment);

      const result = await AppointmentService.cancelAppointment('apt-1', cancelData);

      expect(mockPatch).toHaveBeenCalledWith('/appointments/apt-1/cancel', cancelData);
      expect(result).toEqual(cancelledAppointment);
    });

    it('throws error with API message on failure', async () => {
      mockPatch.mockRejectedValueOnce({
        data: { message: 'Cannot cancel completed appointment' },
        message: 'Request failed',
      });

      await expect(
        AppointmentService.cancelAppointment('apt-1', { cancellationReason: 'reason' })
      ).rejects.toThrow('Cannot cancel completed appointment');
    });
  });

  describe('updateAppointment()', () => {
    it('calls PATCH /appointments/:id', async () => {
      const updateData = { reason: 'Updated reason' } as any;
      const updated = { id: 'apt-1', reason: 'Updated reason' };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await AppointmentService.updateAppointment('apt-1', updateData);

      expect(mockPatch).toHaveBeenCalledWith('/appointments/apt-1', updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAppointment()', () => {
    it('calls DELETE /appointments/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await AppointmentService.deleteAppointment('apt-1');

      expect(mockDelete).toHaveBeenCalledWith('/appointments/apt-1');
    });
  });

  describe('getAppointmentsByDate()', () => {
    it('calls GET /appointments with date param', async () => {
      const appointments = [{ id: '1', reason: 'Morning consultation' }];
      mockGet.mockResolvedValueOnce(appointments);

      const result = await AppointmentService.getAppointmentsByDate('2026-04-15');

      expect(mockGet).toHaveBeenCalledWith('/appointments?date=2026-04-15');
      expect(result).toEqual(appointments);
    });

    it('extracts data from paginated response', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: '1' }] });

      const result = await AppointmentService.getAppointmentsByDate('2026-04-15');

      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('getPatients()', () => {
    it('returns array of patients', async () => {
      const patients = [
        { id: 1, firstName: 'Jean', lastName: 'Dupont' },
        { id: 2, firstName: 'Marie', lastName: 'Martin' },
      ];
      mockGet.mockResolvedValueOnce(patients);

      const result = await AppointmentService.getPatients();

      expect(mockGet).toHaveBeenCalledWith('/patients');
      expect(result).toEqual(patients);
    });

    it('handles paginated response', async () => {
      const patients = [{ id: 1, firstName: 'Jean', lastName: 'Dupont' }];
      mockGet.mockResolvedValueOnce({ data: patients });

      const result = await AppointmentService.getPatients();

      expect(result).toEqual(patients);
    });
  });

  describe('getPractitioners()', () => {
    it('returns array of practitioners', async () => {
      const practitioners = [
        { id: 1, firstName: 'Dr. Sophie', lastName: 'Leroy' },
      ];
      mockGet.mockResolvedValueOnce(practitioners);

      const result = await AppointmentService.getPractitioners();

      expect(mockGet).toHaveBeenCalledWith('/practitioners');
      expect(result).toEqual(practitioners);
    });
  });

  describe('addToWaitQueue()', () => {
    it('calls POST /wait-queue', async () => {
      const queueData = {
        patientId: 'p1',
        practitionerId: 'pr1',
        priority: 'MEDIUM' as any,
        reason: 'Urgent consultation',
      };
      const created = { id: 'wq-1', ...queueData, rank: 1, ticketNumber: 'A001' };
      mockPost.mockResolvedValueOnce(created);

      const result = await AppointmentService.addToWaitQueue(queueData);

      expect(mockPost).toHaveBeenCalledWith('/wait-queue', queueData);
      expect(result).toEqual(created);
    });
  });
});
