import { apiClient, createQueryString } from '@/lib/api';
import {
  AppointmentStatus,
  Appointment,
  AppointmentForm,
  WaitQueueEntry,
  Priority,
  PaginatedResponse,
} from '@/types';

export interface AppointmentSearchParams {
  date?: string;
  practitionerId?: string;
  patientId?: string;
  status?: string; // Changé de AppointmentStatus à string pour éviter les conflits
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface WaitQueueData {
  patientId: string;
  practitionerId: string;
  priority: Priority;
  reason: string;
}

// Types pour patients et praticiens
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Practitioner {
  id: number;
  firstName: string;
  lastName: string;
}

export class AppointmentService {
  // =============================
  // 🔹 Patients & Practitioners
  // =============================
  static async getPatients(): Promise<Patient[]> {
    try {
      const result = await apiClient.get<any>('/patients');
      // Gestion des différents formats de réponse
      if (Array.isArray(result)) {
        return result;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.content && Array.isArray(result.content)) {
        return result.content;
      } else {
        console.warn('⚠️ Format de réponse patients inattendu:', result);
        return [];
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des patients:', error);
      
      // Fournir des données mockées pour le développement en cas d'erreur
      if (process.env.NODE_ENV === 'development') {
        console.warn('Utilisation de données mockées pour les patients');
        return [
          { id: 1, firstName: 'Jean', lastName: 'Dupont' },
          { id: 2, firstName: 'Marie', lastName: 'Martin' },
          { id: 3, firstName: 'Pierre', lastName: 'Durand' },
        ];
      }
      
      throw error;
    }
  }

  static async getPractitioners(): Promise<Practitioner[]> {
    try {
      const result = await apiClient.get<any>('/practitioners');
      // Gestion des différents formats de réponse
      if (Array.isArray(result)) {
        return result;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.content && Array.isArray(result.content)) {
        return result.content;
      } else {
        console.warn('⚠️ Format de réponse praticiens inattendu:', result);
        return [];
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des praticiens:', error);
      
      // Fournir des données mockées pour le développement en cas d'erreur
      if (process.env.NODE_ENV === 'development') {
        console.warn('Utilisation de données mockées pour les praticiens');
        return [
          { id: 1, firstName: 'Dr. Sophie', lastName: 'Leroy' },
          { id: 2, firstName: 'Dr. Thomas', lastName: 'Moreau' },
          { id: 3, firstName: 'Dr. Claire', lastName: 'Dubois' },
        ];
      }
      
      throw error;
    }
  }

  // =============================
  // 🔹 Appointments
  // =============================
  static async getAppointments(params: AppointmentSearchParams = {}): Promise<PaginatedResponse<Appointment>> {
    try {
      const queryString = createQueryString(params);
      const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
      const result = await apiClient.get<any>(endpoint);

      if (Array.isArray(result)) {
        return {
          data: result,
          total: result.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(result.length / (params.limit || 10)),
        };
      } else if (result.data && Array.isArray(result.data)) {
        return {
          data: result.data,
          total: result.total || result.data.length,
          page: result.page || params.page || 1,
          limit: result.limit || params.limit || 10,
          totalPages:
            result.totalPages ||
            Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10)),
        };
      } else if (result.content && Array.isArray(result.content)) {
        return {
          data: result.content,
          total: result.totalElements || result.content.length,
          page: result.number || params.page || 1,
          limit: result.size || params.limit || 10,
          totalPages: result.totalPages || Math.ceil((result.totalElements || result.content.length) / (result.size || params.limit || 10)),
        };
      } else {
        console.warn('⚠️ Unexpected appointments response format:', result);
        return { data: [], total: 0, page: params.page || 1, limit: params.limit || 10, totalPages: 0 };
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  static async getAppointmentById(id: string): Promise<Appointment> {
    try {
      return await apiClient.get<Appointment>(`/appointments/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du rendez-vous ${id}:`, error);
      throw new Error(`Erreur lors de la récupération du rendez-vous: ${error.message}`);
    }
  }

  static async createAppointment(appointmentData: AppointmentForm): Promise<Appointment> {
    try {
      console.log('Envoi des données appointment:', appointmentData);
      
      const response = await apiClient.post<Appointment>('/appointments', appointmentData);
      console.log('Réponse création appointment:', response);
      
      return response;
    } catch (error: any) {
      console.error('Erreur détaillée création appointment:', error);
      
      if (error.data) {
        console.error('Données erreur:', error.data);
        
        // Si l'API retourne des messages d'erreur détaillés
        if (typeof error.data === 'object') {
          if (error.data.message) {
            throw new Error(error.data.message);
          } else if (error.data.error) {
            throw new Error(error.data.error);
          } else if (error.data.violations) {
            const violations = error.data.violations.map((v: any) => v.message).join(', ');
            throw new Error(violations);
          }
        } else if (typeof error.data === 'string') {
          throw new Error(error.data);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de la création du rendez-vous');
    }
  }

  static async updateAppointment(id: string, appointmentData: Partial<AppointmentForm>): Promise<Appointment> {
    try {
      return await apiClient.patch<Appointment>(`/appointments/${id}`, appointmentData);
    } catch (error: any) {
      console.error(`Erreur lors de la modification du rendez-vous ${id}:`, error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de la modification du rendez-vous');
    }
  }

  static async cancelAppointment(
    id: string,
    data: { cancellationReason: string; notifyPatient?: boolean }
  ): Promise<Appointment> {
    try {
      return await apiClient.patch<Appointment>(`/appointments/${id}/cancel`, data);
    } catch (error: any) {
      console.error(`Erreur lors de l'annulation du rendez-vous ${id}:`, error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de l\'annulation du rendez-vous');
    }
  }

  static async deleteAppointment(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/appointments/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du rendez-vous ${id}:`, error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de la suppression du rendez-vous');
    }
  }

  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const result = await apiClient.get<any>(`/appointments?date=${date}`);
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des rendez-vous pour la date ${date}:`, error);
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  static async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    try {
      const queryString = createQueryString({ startDate, endDate });
      const result = await apiClient.get<any>(`/appointments/range?${queryString}`);
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des rendez-vous entre ${startDate} et ${endDate}:`, error);
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  // =============================
  // 🔹 Wait Queue Management
  // =============================
  static async addToWaitQueue(data: WaitQueueData): Promise<WaitQueueEntry> {
    try {
      return await apiClient.post<WaitQueueEntry>('/wait-queue', data);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout à la file d\'attente:', error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de l\'ajout à la file d\'attente');
    }
  }

  static async getWaitQueue(): Promise<WaitQueueEntry[]> {
    try {
      const result = await apiClient.get<any>('/wait-queue');
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la file d\'attente:', error);
      throw new Error(`Erreur lors de la récupération de la file d'attente: ${error.message}`);
    }
  }

  static async updateWaitQueueEntry(id: string, data: Partial<WaitQueueData>): Promise<WaitQueueEntry> {
    try {
      return await apiClient.patch<WaitQueueEntry>(`/wait-queue/${id}`, data);
    } catch (error: any) {
      console.error(`Erreur lors de la modification de l'entrée ${id} de la file d'attente:`, error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de la modification de l\'entrée de la file d\'attente');
    }
  }

  static async removeFromWaitQueue(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/wait-queue/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'entrée ${id} de la file d'attente:`, error);

      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }

      throw new Error(error.message || 'Erreur lors de la suppression de l\'entrée de la file d\'attente');
    }
  }

  static async callNext(): Promise<WaitQueueEntry | null> {
    try {
      return await apiClient.post<WaitQueueEntry>('/wait-queue/call-next', {});
    } catch (error: any) {
      console.error('Erreur lors de l\'appel du prochain patient:', error);

      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }

      throw new Error(error.message || 'Erreur lors de l\'appel du prochain patient');
    }
  }

  static async getCurrentlyServing(): Promise<WaitQueueEntry | null> {
    try {
      return await apiClient.get<WaitQueueEntry>('/wait-queue/currently-serving');
    } catch (error: any) {
      console.error('Erreur lors de la récupération du patient en cours:', error);
      throw new Error(`Erreur lors de la récupération du patient en cours: ${error.message}`);
    }
  }

  static async markAsServing(id: string): Promise<WaitQueueEntry> {
    try {
      return await apiClient.post<WaitQueueEntry>(`/wait-queue/${id}/mark-serving`, {});
    } catch (error: any) {
      console.error(`Erreur lors du marquage de l'entrée ${id} comme en cours:`, error);

      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }

      throw new Error(error.message || 'Erreur lors du marquage de l\'entrée comme en cours');
    }
  }

  static async completeQueueEntry(id: string): Promise<void> {
    try {
      await apiClient.post<void>(`/wait-queue/${id}/complete`, {});
    } catch (error: any) {
      console.error(`Erreur lors de la complétion de l'entrée ${id}:`, error);

      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }

      throw new Error(error.message || 'Erreur lors de la complétion de l\'entrée');
    }
  }

  // =============================
  // 🔹 Practitioner Schedule
  // =============================
  static async getPractitionerTodayAppointments(): Promise<Appointment[]> {
    try {
      const result = await apiClient.get<any>('/practitioner/schedule/appointments');
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des rendez-vous du jour:', error);
      throw new Error(`Erreur lors de la récupération des rendez-vous du jour: ${error.message}`);
    }
  }

  static async getPractitionerAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const result = await apiClient.get<any>(`/practitioner/schedule/appointments?date=${date}`);
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des rendez-vous pour la date ${date}:`, error);
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  static async getPractitionerWeeklyAppointments(): Promise<Appointment[]> {
    try {
      const result = await apiClient.get<any>('/practitioner/schedule/appointments/week');
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
      throw new Error(`Erreur lors de la récupération des rendez-vous de la semaine: ${error.message}`);
    }
  }

  static async getPractitionerMonthlyAppointments(): Promise<Appointment[]> {
    try {
      const result = await apiClient.get<any>('/practitioner/schedule/appointments/month');
      return Array.isArray(result) ? result : result.data || result.content || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des rendez-vous du mois:', error);
      throw new Error(`Erreur lors de la récupération des rendez-vous du mois: ${error.message}`);
    }
  }

  static async getPractitionerAppointmentById(id: string): Promise<Appointment> {
    try {
      return await apiClient.get<Appointment>(`/practitioner/schedule/appointments/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du rendez-vous ${id}:`, error);
      throw new Error(`Erreur lors de la récupération du rendez-vous: ${error.message}`);
    }
  }

  static async getPractitionerAvailability(): Promise<any> {
    try {
      return await apiClient.get('/practitioner/schedule/availability');
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la disponibilité:', error);
      throw new Error(`Erreur lors de la récupération de la disponibilité: ${error.message}`);
    }
  }

  static async getPractitionerStats(): Promise<{
    todayAppointments: number;
    weekAppointments: number;
    monthAppointments: number;
    completionRate: number;
  }> {
    try {
      return await apiClient.get('/practitioner/schedule/stats');
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // =============================
  // 🔹 Appointment statistics
  // =============================
  static async getAppointmentStats(period: 'day' | 'week' | 'month' = 'month'): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPractitioner: Array<{ practitionerId: string; name: string; count: number }>;
    byUrgency: Record<string, number>;
    averageDuration: number;
  }> {
    try {
      return await apiClient.get(`/appointments/stats?period=${period}`);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques des rendez-vous:', error);
      throw new Error(`Erreur lors de la récupération des statistiques des rendez-vous: ${error.message}`);
    }
  }

  static async checkAvailability(
    practitionerId: string,
    date: string,
    duration: number
  ): Promise<{ available: boolean; suggestedSlots: Array<{ start: string; end: string }> }> {
    try {
      const queryString = createQueryString({ practitionerId, date, duration });
      return await apiClient.get(`/appointments/availability?${queryString}`);
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la disponibilité:', error);
      throw new Error(`Erreur lors de la vérification de la disponibilité: ${error.message}`);
    }
  }

  // =============================
  // 🔹 Bulk operations
  // =============================
  static async bulkUpdateAppointments(
    appointmentIds: string[],
    updates: Partial<AppointmentForm>
  ): Promise<Appointment[]> {
    try {
      return await apiClient.patch<Appointment[]>('/appointments/bulk-update', {
        appointmentIds,
        updates,
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour groupée des rendez-vous:', error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de la mise à jour groupée des rendez-vous');
    }
  }

  static async bulkCancelAppointments(appointmentIds: string[], reason: string): Promise<void> {
    try {
      await apiClient.patch<void>('/appointments/bulk-cancel', {
        appointmentIds,
        cancellationReason: reason,
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation groupée des rendez-vous:', error);
      
      if (error.data) {
        if (error.data.message) {
          throw new Error(error.data.message);
        } else if (error.data.error) {
          throw new Error(error.data.error);
        }
      }
      
      throw new Error(error.message || 'Erreur lors de l\'annulation groupée des rendez-vous');
    }
  }
}