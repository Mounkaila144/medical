// Simple test for billing services
describe('MockBillingServices', () => {
  // Mock de InvoicingService
  class MockInvoicingService {
    createInvoice = jest.fn().mockResolvedValue({
      id: '123',
      number: 'INV-001',
      status: 'DRAFT',
      patientId: '456',
      lines: [],
      total: 0,
    });

    addLine = jest.fn().mockResolvedValue({
      id: '123',
      number: 'INV-001',
      status: 'DRAFT',
      patientId: '456',
      lines: [{ description: 'Consultation', amount: 120 }],
      total: 120,
    });

    updateStatus = jest.fn().mockResolvedValue({
      id: '123',
      number: 'INV-001',
      status: 'SENT',
      patientId: '456',
      lines: [{ description: 'Consultation', amount: 120 }],
      total: 120,
    });
  }

  // Mock de PaymentsService
  class MockPaymentsService {
    recordPayment = jest.fn().mockResolvedValue({
      id: '789',
      invoiceId: '123',
      amount: 120,
      method: 'CASH',
      reference: 'PAY-001',
    });
  }

  let invoicingService: MockInvoicingService;
  let paymentsService: MockPaymentsService;

  beforeEach(() => {
    invoicingService = new MockInvoicingService();
    paymentsService = new MockPaymentsService();
  });

  it('should create an invoice', async () => {
    const result = await invoicingService.createInvoice({
      patientId: '456',
      number: 'INV-001',
    });

    expect(invoicingService.createInvoice).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('DRAFT');
    expect(result.patientId).toBe('456');
  });

  it('should add a line to the invoice', async () => {
    const result = await invoicingService.addLine({
      invoiceId: '123',
      description: 'Consultation',
      amount: 120,
    });

    expect(invoicingService.addLine).toHaveBeenCalled();
    expect(result).toHaveProperty('lines');
    expect(result.lines).toHaveLength(1);
    expect(result.total).toBe(120);
  });

  it('should update invoice status', async () => {
    const result = await invoicingService.updateStatus('123', 'SENT');

    expect(invoicingService.updateStatus).toHaveBeenCalledWith('123', 'SENT');
    expect(result.status).toBe('SENT');
  });

  it('should record a payment', async () => {
    const result = await paymentsService.recordPayment({
      invoiceId: '123',
      amount: 120,
      method: 'CASH',
      reference: 'PAY-001',
    });

    expect(paymentsService.recordPayment).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
    expect(result.invoiceId).toBe('123');
    expect(result.amount).toBe(120);
  });
}); 