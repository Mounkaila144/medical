import { describe, it, expect } from 'vitest';
import { ROLE_ROUTES, ROLE_DASHBOARD } from '@/lib/role-routes';

describe('ROLE_ROUTES', () => {
  describe('SUPERADMIN', () => {
    it('includes /admin route', () => {
      expect(ROLE_ROUTES.SUPERADMIN).toContain('/admin');
    });
  });

  describe('CLINIC_ADMIN', () => {
    it('includes /dashboard', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/dashboard');
    });

    it('includes /patients', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/patients');
    });

    it('includes /practitioners', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/practitioners');
    });

    it('includes /encounters', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/encounters');
    });

    it('includes /appointments', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/appointments');
    });

    it('includes /billing', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/billing');
    });

    it('includes /accounting', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/accounting');
    });

    it('includes /profile', () => {
      expect(ROLE_ROUTES.CLINIC_ADMIN).toContain('/profile');
    });
  });

  describe('EMPLOYEE', () => {
    it('includes /dashboard', () => {
      expect(ROLE_ROUTES.EMPLOYEE).toContain('/dashboard');
    });

    it('includes /patients', () => {
      expect(ROLE_ROUTES.EMPLOYEE).toContain('/patients');
    });

    it('includes /appointments', () => {
      expect(ROLE_ROUTES.EMPLOYEE).toContain('/appointments');
    });

    it('includes /profile', () => {
      expect(ROLE_ROUTES.EMPLOYEE).toContain('/profile');
    });

    it('does NOT include /admin', () => {
      expect(ROLE_ROUTES.EMPLOYEE).not.toContain('/admin');
    });

    it('does NOT include /encounters', () => {
      expect(ROLE_ROUTES.EMPLOYEE).not.toContain('/encounters');
    });
  });

  describe('PRACTITIONER', () => {
    it('includes /practitioner', () => {
      expect(ROLE_ROUTES.PRACTITIONER).toContain('/practitioner');
    });

    it('includes /patients', () => {
      expect(ROLE_ROUTES.PRACTITIONER).toContain('/patients');
    });

    it('includes /encounters', () => {
      expect(ROLE_ROUTES.PRACTITIONER).toContain('/encounters');
    });

    it('includes /appointments', () => {
      expect(ROLE_ROUTES.PRACTITIONER).toContain('/appointments');
    });

    it('includes /profile', () => {
      expect(ROLE_ROUTES.PRACTITIONER).toContain('/profile');
    });

    it('does NOT include /admin', () => {
      expect(ROLE_ROUTES.PRACTITIONER).not.toContain('/admin');
    });

    it('does NOT include /billing', () => {
      expect(ROLE_ROUTES.PRACTITIONER).not.toContain('/billing');
    });
  });

  describe('ACCOUNTANT', () => {
    it('includes /accounting', () => {
      expect(ROLE_ROUTES.ACCOUNTANT).toContain('/accounting');
    });

    it('includes /profile', () => {
      expect(ROLE_ROUTES.ACCOUNTANT).toContain('/profile');
    });

    it('does NOT include /patients', () => {
      expect(ROLE_ROUTES.ACCOUNTANT).not.toContain('/patients');
    });

    it('does NOT include /admin', () => {
      expect(ROLE_ROUTES.ACCOUNTANT).not.toContain('/admin');
    });

    it('does NOT include /encounters', () => {
      expect(ROLE_ROUTES.ACCOUNTANT).not.toContain('/encounters');
    });
  });

  describe('all non-superadmin roles have /profile', () => {
    it('every role except SUPERADMIN has /profile route', () => {
      for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
        if (role === 'SUPERADMIN') {
          // SUPERADMIN routes only include /admin (has full access implicitly)
          expect(routes).not.toContain('/profile');
        } else {
          expect(routes, `${role} should have /profile`).toContain('/profile');
        }
      }
    });
  });
});

describe('ROLE_DASHBOARD', () => {
  it('maps SUPERADMIN to /admin/dashboard', () => {
    expect(ROLE_DASHBOARD.SUPERADMIN).toBe('/admin/dashboard');
  });

  it('maps CLINIC_ADMIN to /dashboard', () => {
    expect(ROLE_DASHBOARD.CLINIC_ADMIN).toBe('/dashboard');
  });

  it('maps EMPLOYEE to /dashboard', () => {
    expect(ROLE_DASHBOARD.EMPLOYEE).toBe('/dashboard');
  });

  it('maps PRACTITIONER to /practitioner/dashboard', () => {
    expect(ROLE_DASHBOARD.PRACTITIONER).toBe('/practitioner/dashboard');
  });

  it('maps ACCOUNTANT to /accounting/dashboard', () => {
    expect(ROLE_DASHBOARD.ACCOUNTANT).toBe('/accounting/dashboard');
  });

  it('has an entry for every role in ROLE_ROUTES', () => {
    for (const role of Object.keys(ROLE_ROUTES)) {
      expect(ROLE_DASHBOARD, `ROLE_DASHBOARD should have entry for ${role}`).toHaveProperty(role);
    }
  });
});
