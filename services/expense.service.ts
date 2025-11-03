import { apiClient, createQueryString } from '@/lib/api';
import { Expense, PaginatedResponse, ExpenseCategory, ExpenseStatus, PaymentStatus } from '@/types';

export interface ExpenseForm {
  reference: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  supplierName?: string;
  supplierContact?: string;
  status?: ExpenseStatus;
  paymentStatus?: PaymentStatus;
  expenseDate: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ExpenseSearchParams {
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseStats {
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  byCategory: {
    category: ExpenseCategory;
    total: number;
  }[];
}

export class ExpenseService {
  static async getExpenses(params: ExpenseSearchParams = {}): Promise<PaginatedResponse<Expense>> {
    try {
      const queryString = createQueryString(params);
      const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';
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
          totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10)),
        };
      }

      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
  }

  static async getExpenseById(id: string): Promise<Expense> {
    try {
      return await apiClient.get<Expense>(`/expenses/${id}`);
    } catch (error: any) {
      console.error(`Error fetching expense ${id}:`, error);
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }
  }

  static async createExpense(data: ExpenseForm): Promise<Expense> {
    try {
      return await apiClient.post<Expense>('/expenses', data);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }
  }

  static async updateExpense(id: string, data: Partial<ExpenseForm>): Promise<Expense> {
    try {
      return await apiClient.patch<Expense>(`/expenses/${id}`, data);
    } catch (error: any) {
      console.error(`Error updating expense ${id}:`, error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/expenses/${id}`);
    } catch (error: any) {
      console.error(`Error deleting expense ${id}:`, error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }

  static async getStats(): Promise<ExpenseStats> {
    try {
      return await apiClient.get<ExpenseStats>('/expenses/stats');
    } catch (error: any) {
      console.error('Error fetching expense stats:', error);
      throw new Error(`Failed to fetch expense stats: ${error.message}`);
    }
  }
}
