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
  PaymentMethod: {
    CASH: 'CASH',
    CARD: 'CARD',
    MOBILE: 'MOBILE',
    BANK_TRANSFER: 'BANK_TRANSFER',
  },
}));

import { BillingService } from '@/services/billing.service';

describe('BillingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================
  // Invoices
  // =============================
  describe('getInvoices()', () => {
    it('calls GET /invoices without params', async () => {
      const invoices = [
        { id: 'inv-1', number: 'INV-001', total: 5000 },
        { id: 'inv-2', number: 'INV-002', total: 3000 },
      ];
      mockGet.mockResolvedValueOnce(invoices);

      const result = await BillingService.getInvoices();

      expect(mockGet).toHaveBeenCalledWith('/invoices');
      expect(result.data).toEqual(invoices);
      expect(result.total).toBe(2);
    });

    it('calls GET with query params', async () => {
      mockGet.mockResolvedValueOnce([]);

      await BillingService.getInvoices({ patientId: 'p1', status: 'PAID', page: 2 });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('patientId=p1');
      expect(calledUrl).toContain('status=PAID');
      expect(calledUrl).toContain('page=2');
    });

    it('normalizes array response into PaginatedResponse', async () => {
      const invoices = [{ id: '1' }, { id: '2' }];
      mockGet.mockResolvedValueOnce(invoices);

      const result = await BillingService.getInvoices();

      expect(result).toEqual({
        data: invoices,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('normalizes paginated response', async () => {
      const paginatedResponse = {
        data: [{ id: '1' }],
        total: 50,
        page: 3,
        limit: 10,
        totalPages: 5,
      };
      mockGet.mockResolvedValueOnce(paginatedResponse);

      const result = await BillingService.getInvoices({ page: 3, limit: 10 });

      expect(result.data).toEqual([{ id: '1' }]);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
    });

    it('handles Spring-style content response', async () => {
      const springResponse = {
        content: [{ id: '1' }],
        totalElements: 20,
        number: 1,
        size: 10,
        totalPages: 2,
      };
      mockGet.mockResolvedValueOnce(springResponse);

      const result = await BillingService.getInvoices();

      expect(result.data).toEqual([{ id: '1' }]);
      expect(result.total).toBe(20);
    });

    it('returns empty result for unexpected format', async () => {
      mockGet.mockResolvedValueOnce({ unexpected: true });

      const result = await BillingService.getInvoices();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('throws on fetch error', async () => {
      mockGet.mockRejectedValueOnce({ message: 'Network error' });

      await expect(BillingService.getInvoices()).rejects.toThrow('Failed to fetch invoices');
    });
  });

  describe('getInvoiceById()', () => {
    it('calls GET /invoices/:id', async () => {
      const invoice = { id: 'inv-1', number: 'INV-001', total: 5000 };
      mockGet.mockResolvedValueOnce(invoice);

      const result = await BillingService.getInvoiceById('inv-1');

      expect(mockGet).toHaveBeenCalledWith('/invoices/inv-1');
      expect(result).toEqual(invoice);
    });
  });

  describe('createInvoice()', () => {
    it('calls POST /invoices with invoice data', async () => {
      const invoiceData = {
        patientId: 'patient-1',
        dueAt: '2026-05-01',
        notes: 'Consultation generale',
      };
      const created = { id: 'inv-new', number: 'INV-003', ...invoiceData };
      mockPost.mockResolvedValueOnce(created);

      const result = await BillingService.createInvoice(invoiceData);

      expect(mockPost).toHaveBeenCalledWith('/invoices', invoiceData);
      expect(result).toEqual(created);
    });

    it('throws on creation error', async () => {
      mockPost.mockRejectedValueOnce({ message: 'Patient not found' });

      await expect(
        BillingService.createInvoice({ patientId: 'nonexistent' })
      ).rejects.toThrow('Failed to create invoice');
    });
  });

  describe('updateInvoice()', () => {
    it('calls PATCH /invoices/:id', async () => {
      const updateData = { notes: 'Updated notes' };
      const updated = { id: 'inv-1', notes: 'Updated notes' };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await BillingService.updateInvoice('inv-1', updateData);

      expect(mockPatch).toHaveBeenCalledWith('/invoices/inv-1', updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteInvoice()', () => {
    it('calls DELETE /invoices/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await BillingService.deleteInvoice('inv-1');

      expect(mockDelete).toHaveBeenCalledWith('/invoices/inv-1');
    });
  });

  describe('addInvoiceLine()', () => {
    it('calls POST /invoices/line', async () => {
      const lineData = {
        invoiceId: 'inv-1',
        description: 'Consultation',
        qty: 1,
        unitPrice: 5000,
      };
      const created = { id: 'line-1', ...lineData };
      mockPost.mockResolvedValueOnce(created);

      const result = await BillingService.addInvoiceLine(lineData);

      expect(mockPost).toHaveBeenCalledWith('/invoices/line', lineData);
      expect(result).toEqual(created);
    });
  });

  describe('sendInvoice()', () => {
    it('calls POST /invoices/:id/send', async () => {
      const sendData = { method: 'email', recipient: 'patient@test.com', message: 'Votre facture' };
      mockPost.mockResolvedValueOnce(undefined);

      await BillingService.sendInvoice('inv-1', sendData);

      expect(mockPost).toHaveBeenCalledWith('/invoices/inv-1/send', sendData);
    });
  });

  // =============================
  // Payments
  // =============================
  describe('getPayments()', () => {
    it('calls GET /payments without params', async () => {
      const payments = [
        { id: 'pay-1', amount: 5000, method: 'CASH' },
        { id: 'pay-2', amount: 3000, method: 'CARD' },
      ];
      mockGet.mockResolvedValueOnce(payments);

      const result = await BillingService.getPayments();

      expect(mockGet).toHaveBeenCalledWith('/payments');
      expect(result.data).toEqual(payments);
      expect(result.total).toBe(2);
    });

    it('calls GET with query params', async () => {
      mockGet.mockResolvedValueOnce([]);

      await BillingService.getPayments({ invoiceId: 'inv-1', method: 'CASH' });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('invoiceId=inv-1');
      expect(calledUrl).toContain('method=CASH');
    });

    it('normalizes array response', async () => {
      const payments = [{ id: '1' }, { id: '2' }, { id: '3' }];
      mockGet.mockResolvedValueOnce(payments);

      const result = await BillingService.getPayments({ limit: 5 });

      expect(result).toEqual({
        data: payments,
        total: 3,
        page: 1,
        limit: 5,
        totalPages: 1,
      });
    });

    it('normalizes paginated response', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ id: '1' }],
        total: 100,
        page: 5,
        limit: 20,
        totalPages: 5,
      });

      const result = await BillingService.getPayments({ page: 5, limit: 20 });

      expect(result.total).toBe(100);
      expect(result.page).toBe(5);
    });

    it('returns empty result for unexpected format', async () => {
      mockGet.mockResolvedValueOnce({ foo: 'bar' });

      const result = await BillingService.getPayments();

      expect(result.data).toEqual([]);
    });
  });

  describe('getPaymentById()', () => {
    it('calls GET /payments/:id', async () => {
      const payment = { id: 'pay-1', amount: 5000 };
      mockGet.mockResolvedValueOnce(payment);

      const result = await BillingService.getPaymentById('pay-1');

      expect(mockGet).toHaveBeenCalledWith('/payments/pay-1');
      expect(result).toEqual(payment);
    });
  });

  describe('createPayment()', () => {
    it('calls POST /payments with payment data', async () => {
      const paymentData = {
        invoiceId: 'inv-1',
        amount: 5000,
        currency: 'XOF',
        method: 'CASH' as any,
        paidAt: '2026-04-11T12:00:00Z',
      };
      const created = { id: 'pay-new', ...paymentData };
      mockPost.mockResolvedValueOnce(created);

      const result = await BillingService.createPayment(paymentData);

      expect(mockPost).toHaveBeenCalledWith('/payments', paymentData);
      expect(result).toEqual(created);
    });

    it('throws on creation error', async () => {
      mockPost.mockRejectedValueOnce({ message: 'Invoice not found' });

      await expect(
        BillingService.createPayment({
          invoiceId: 'nonexistent',
          amount: 1000,
          currency: 'XOF',
          method: 'CASH' as any,
          paidAt: '2026-04-11',
        })
      ).rejects.toThrow('Failed to create payment');
    });
  });

  describe('updatePayment()', () => {
    it('calls PATCH /payments/:id', async () => {
      const updateData = { amount: 6000 };
      const updated = { id: 'pay-1', amount: 6000 };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await BillingService.updatePayment('pay-1', updateData);

      expect(mockPatch).toHaveBeenCalledWith('/payments/pay-1', updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('deletePayment()', () => {
    it('calls DELETE /payments/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await BillingService.deletePayment('pay-1');

      expect(mockDelete).toHaveBeenCalledWith('/payments/pay-1');
    });
  });

  // =============================
  // Tariffs
  // =============================
  describe('getTariffs()', () => {
    it('calls GET /tariffs without params', async () => {
      const tariffs = [
        { id: 't1', code: 'CONS-001', name: 'Consultation', price: 5000 },
      ];
      mockGet.mockResolvedValueOnce(tariffs);

      const result = await BillingService.getTariffs();

      expect(mockGet).toHaveBeenCalledWith('/tariffs');
      expect(result.data).toEqual(tariffs);
    });

    it('calls GET with search params', async () => {
      mockGet.mockResolvedValueOnce([]);

      await BillingService.getTariffs({ category: 'CONSULTATION', isActive: true });

      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl).toContain('category=CONSULTATION');
      expect(calledUrl).toContain('isActive=true');
    });

    it('normalizes array response', async () => {
      const tariffs = [{ id: '1' }];
      mockGet.mockResolvedValueOnce(tariffs);

      const result = await BillingService.getTariffs();

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getTariffById()', () => {
    it('calls GET /tariffs/:id', async () => {
      const tariff = { id: 't1', code: 'CONS-001', price: 5000 };
      mockGet.mockResolvedValueOnce(tariff);

      const result = await BillingService.getTariffById('t1');

      expect(mockGet).toHaveBeenCalledWith('/tariffs/t1');
      expect(result).toEqual(tariff);
    });
  });

  describe('createTariff()', () => {
    it('calls POST /tariffs', async () => {
      const tariffData = {
        code: 'LAB-001',
        name: 'Blood test',
        category: 'LABORATORY',
        price: 3000,
        currency: 'XOF',
      };
      const created = { id: 't-new', ...tariffData };
      mockPost.mockResolvedValueOnce(created);

      const result = await BillingService.createTariff(tariffData);

      expect(mockPost).toHaveBeenCalledWith('/tariffs', tariffData);
      expect(result).toEqual(created);
    });
  });

  describe('updateTariff()', () => {
    it('calls PATCH /tariffs/:id', async () => {
      const updateData = { price: 6000 };
      mockPatch.mockResolvedValueOnce({ id: 't1', price: 6000 });

      await BillingService.updateTariff('t1', updateData);

      expect(mockPatch).toHaveBeenCalledWith('/tariffs/t1', updateData);
    });
  });

  describe('deleteTariff()', () => {
    it('calls DELETE /tariffs/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await BillingService.deleteTariff('t1');

      expect(mockDelete).toHaveBeenCalledWith('/tariffs/t1');
    });
  });
});
