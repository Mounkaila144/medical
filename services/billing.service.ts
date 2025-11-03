import { apiClient, createQueryString } from '@/lib/api';
import {
  Invoice,
  Payment,
  Tariff,
  PaginatedResponse,
  PaymentMethod,
} from '@/types';

export interface TariffForm {
  code: string;
  name: string;
  description?: string;
  category: string;
  costPrice?: number;
  price: number;
  currency: string;
  duration?: number;
  isActive?: boolean;
}

export interface InvoiceForm {
  patientId: string;
  encounterId?: string;
  dueAt?: string;
  notes?: string;
}

export interface InvoiceItemForm {
  invoiceId: string;
  description: string;
  qty: number;
  unitPrice: number;
  tax?: number;
  thirdPartyRate?: number;
}

export interface PaymentForm {
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
  notes?: string;
}

export interface InvoiceSearchParams {
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaymentSearchParams {
  invoiceId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TariffSearchParams {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class BillingService {
  // =============================
  // 🔹 Tariffs
  // =============================
  static async getTariffs(params: TariffSearchParams = {}): Promise<PaginatedResponse<Tariff>> {
    try {
      const queryString = createQueryString(params);
      const endpoint = queryString ? `/tariffs?${queryString}` : '/tariffs';
      const result = await apiClient.get<any>(endpoint);

      // Handle different response formats
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
          totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10)),
        };
      } else if (result.content && Array.isArray(result.content)) {
        return {
          data: result.content,
          total: result.totalElements || result.content.length,
          page: result.number || params.page || 1,
          limit: result.size || params.limit || 10,
          totalPages: result.totalPages || Math.ceil((result.totalElements || result.content.length) / (result.size || params.limit || 10)),
        };
      }

      console.warn('⚠️ Unexpected tariffs response format:', result);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    } catch (error: any) {
      console.error('Error fetching tariffs:', error);
      throw new Error(`Failed to fetch tariffs: ${error.message}`);
    }
  }

  static async getTariffById(id: string): Promise<Tariff> {
    try {
      return await apiClient.get<Tariff>(`/tariffs/${id}`);
    } catch (error: any) {
      console.error(`Error fetching tariff ${id}:`, error);
      throw new Error(`Failed to fetch tariff: ${error.message}`);
    }
  }

  static async createTariff(data: TariffForm): Promise<Tariff> {
    try {
      return await apiClient.post<Tariff>('/tariffs', data);
    } catch (error: any) {
      console.error('Error creating tariff:', error);
      throw new Error(`Failed to create tariff: ${error.message}`);
    }
  }

  static async updateTariff(id: string, data: Partial<TariffForm>): Promise<Tariff> {
    try {
      return await apiClient.patch<Tariff>(`/tariffs/${id}`, data);
    } catch (error: any) {
      console.error(`Error updating tariff ${id}:`, error);
      throw new Error(`Failed to update tariff: ${error.message}`);
    }
  }

  static async deleteTariff(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/tariffs/${id}`);
    } catch (error: any) {
      console.error(`Error deleting tariff ${id}:`, error);
      throw new Error(`Failed to delete tariff: ${error.message}`);
    }
  }

  // =============================
  // 🔹 Invoices
  // =============================
  static async getInvoices(params: InvoiceSearchParams = {}): Promise<PaginatedResponse<Invoice>> {
    try {
      const queryString = createQueryString(params);
      const endpoint = queryString ? `/invoices?${queryString}` : '/invoices';
      const result = await apiClient.get<any>(endpoint);

      // Handle different response formats
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
          totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10)),
        };
      } else if (result.content && Array.isArray(result.content)) {
        return {
          data: result.content,
          total: result.totalElements || result.content.length,
          page: result.number || params.page || 1,
          limit: result.size || params.limit || 10,
          totalPages: result.totalPages || Math.ceil((result.totalElements || result.content.length) / (result.size || params.limit || 10)),
        };
      }

      console.warn('⚠️ Unexpected invoices response format:', result);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
  }

  static async getInvoiceById(id: string): Promise<Invoice> {
    try {
      return await apiClient.get<Invoice>(`/invoices/${id}`);
    } catch (error: any) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }
  }

  static async createInvoice(data: InvoiceForm): Promise<Invoice> {
    try {
      return await apiClient.post<Invoice>('/invoices', data);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  static async addInvoiceLine(data: InvoiceItemForm): Promise<any> {
    try {
      return await apiClient.post<any>('/invoices/line', data);
    } catch (error: any) {
      console.error('Error adding invoice line:', error);
      throw new Error(`Failed to add invoice line: ${error.message}`);
    }
  }

  static async updateInvoice(id: string, data: Partial<InvoiceForm>): Promise<Invoice> {
    try {
      return await apiClient.patch<Invoice>(`/invoices/${id}`, data);
    } catch (error: any) {
      console.error(`Error updating invoice ${id}:`, error);
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
  }

  static async deleteInvoice(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/invoices/${id}`);
    } catch (error: any) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  }

  static async sendInvoice(id: string, data: { method: string; recipient: string; message?: string }): Promise<void> {
    try {
      await apiClient.post<void>(`/invoices/${id}/send`, data);
    } catch (error: any) {
      console.error(`Error sending invoice ${id}:`, error);
      throw new Error(`Failed to send invoice: ${error.message}`);
    }
  }

  // =============================
  // 🔹 Payments
  // =============================
  static async getPayments(params: PaymentSearchParams = {}): Promise<PaginatedResponse<Payment>> {
    try {
      const queryString = createQueryString(params);
      const endpoint = queryString ? `/payments?${queryString}` : '/payments';
      const result = await apiClient.get<any>(endpoint);

      // Handle different response formats
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
          totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10)),
        };
      } else if (result.content && Array.isArray(result.content)) {
        return {
          data: result.content,
          total: result.totalElements || result.content.length,
          page: result.number || params.page || 1,
          limit: result.size || params.limit || 10,
          totalPages: result.totalPages || Math.ceil((result.totalElements || result.content.length) / (result.size || params.limit || 10)),
        };
      }

      console.warn('⚠️ Unexpected payments response format:', result);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  }

  static async getPaymentById(id: string): Promise<Payment> {
    try {
      return await apiClient.get<Payment>(`/payments/${id}`);
    } catch (error: any) {
      console.error(`Error fetching payment ${id}:`, error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  static async createPayment(data: PaymentForm): Promise<Payment> {
    try {
      return await apiClient.post<Payment>('/payments', data);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  static async updatePayment(id: string, data: Partial<PaymentForm>): Promise<Payment> {
    try {
      return await apiClient.patch<Payment>(`/payments/${id}`, data);
    } catch (error: any) {
      console.error(`Error updating payment ${id}:`, error);
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  static async deletePayment(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/payments/${id}`);
    } catch (error: any) {
      console.error(`Error deleting payment ${id}:`, error);
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }
}
