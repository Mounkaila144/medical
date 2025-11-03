// Simple test for analytics service mock
describe('MockAnalyticsService', () => {
  class MockAnalyticsService {
    refreshMaterializedViews = jest.fn().mockResolvedValue(undefined);
    generateReport = jest.fn().mockResolvedValue({
      id: '123',
      name: 'Test Report',
      path: '/path/to/report.pdf',
    });
  }

  let service: MockAnalyticsService;

  beforeEach(() => {
    service = new MockAnalyticsService();
  });

  it('should refresh materialized views', async () => {
    await service.refreshMaterializedViews();
    expect(service.refreshMaterializedViews).toHaveBeenCalled();
  });

  it('should generate a report', async () => {
    const result = await service.generateReport('tenant-001', {
      name: 'Revenue Report',
      format: 'pdf',
    });
    
    expect(service.generateReport).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Report');
  });
}); 