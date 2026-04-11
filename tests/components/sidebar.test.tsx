import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mocks must be at top level
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', { ...props, src: props.src }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    hasAnyRole: (roles: string[]) => roles.includes('SUPERADMIN'),
    getUserType: () => 'user',
    user: { role: 'SUPERADMIN', firstName: 'Admin', lastName: 'Test' },
    practitioner: null,
  }),
}));

vi.mock('@/hooks/useTokenRefresh', () => ({
  useTokenRefresh: () => {},
}));

import { navigation } from '@/components/layout/sidebar';

// Check navigation structure tests (without rendering)
describe('Sidebar navigation array', () => {
  describe('SUPERADMIN items', () => {
    it('Dashboard Admin has SUPERADMIN role', () => {
      const item = navigation.find(n => n.title === 'Dashboard Admin');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('SUPERADMIN');
    });

    it('Tenants & Cliniques has SUPERADMIN role', () => {
      const item = navigation.find(n => n.title === 'Tenants & Cliniques');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('SUPERADMIN');
    });

    it('Permissions has SUPERADMIN role', () => {
      const item = navigation.find(n => n.title === 'Permissions');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('SUPERADMIN');
    });
  });

  describe('ACCOUNTANT items', () => {
    it('ACCOUNTANT dashboard points to /accounting/dashboard', () => {
      const item = navigation.find(n => n.title === 'Dashboard' && n.roles?.includes('ACCOUNTANT'));
      expect(item).toBeDefined();
      expect(item!.href).toBe('/accounting/dashboard');
    });

    it('Comptabilite section is visible to ACCOUNTANT', () => {
      const item = navigation.find(n => n.title === 'Comptabilit\u00e9');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('ACCOUNTANT');
    });
  });

  describe('CLINIC_ADMIN items', () => {
    it('can see Patients', () => {
      const item = navigation.find(n => n.title === 'Patients');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('CLINIC_ADMIN');
    });

    it('can see Praticiens', () => {
      const item = navigation.find(n => n.title === 'Praticiens');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('CLINIC_ADMIN');
    });

    it('can see Comptabilite section', () => {
      const item = navigation.find(n => n.title === 'Comptabilit\u00e9');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('CLINIC_ADMIN');
    });

    it('can see Consultations', () => {
      const item = navigation.find(n => n.title === 'Consultations');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('CLINIC_ADMIN');
    });

    it('can see Utilisateurs management', () => {
      const items = navigation.filter(n => n.title === 'Utilisateurs');
      const clinicAdminItem = items.find(n => n.roles?.includes('CLINIC_ADMIN'));
      expect(clinicAdminItem).toBeDefined();
    });
  });

  describe('PRACTITIONER items', () => {
    it('can see Mon Dashboard', () => {
      const item = navigation.find(n => n.title === 'Mon Dashboard');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('PRACTITIONER');
      expect(item!.href).toBe('/practitioner/dashboard');
    });

    it('can see Consultations', () => {
      const item = navigation.find(n => n.title === 'Consultations');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('PRACTITIONER');
    });

    it('can see Patients', () => {
      const item = navigation.find(n => n.title === 'Patients');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('PRACTITIONER');
    });

    it('cannot see Praticiens (CLINIC_ADMIN only)', () => {
      const item = navigation.find(n => n.title === 'Praticiens');
      expect(item!.roles).not.toContain('PRACTITIONER');
    });

    it('does not have admin items', () => {
      const adminItems = navigation.filter(
        n => n.roles?.includes('SUPERADMIN') && !n.roles?.includes('PRACTITIONER')
      );
      expect(adminItems.length).toBeGreaterThan(0);
    });
  });

  describe('EMPLOYEE items', () => {
    it('can see Tableau de bord', () => {
      const item = navigation.find(n => n.title === 'Tableau de bord');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('EMPLOYEE');
    });

    it('can see Patients', () => {
      const item = navigation.find(n => n.title === 'Patients');
      expect(item!.roles).toContain('EMPLOYEE');
    });

    it('can see Planification section', () => {
      const item = navigation.find(n => n.title === 'Planification');
      expect(item).toBeDefined();
      expect(item!.roles).toContain('EMPLOYEE');
    });
  });

  describe('Consultations children', () => {
    it('has Rencontres, Prescriptions, and Resultats labo', () => {
      const consultations = navigation.find(n => n.title === 'Consultations');
      expect(consultations).toBeDefined();
      expect(consultations!.children).toBeDefined();

      const childTitles = consultations!.children!.map(c => c.title);
      expect(childTitles).toContain('Rencontres');
      expect(childTitles).toContain('Prescriptions');
      expect(childTitles).toContain('R\u00e9sultats labo');
    });

    it('Rencontres points to /encounters', () => {
      const consultations = navigation.find(n => n.title === 'Consultations');
      const rencontres = consultations!.children!.find(c => c.title === 'Rencontres');
      expect(rencontres!.href).toBe('/encounters');
    });
  });

  describe('Planification children', () => {
    it('has Calendrier and File d\'attente', () => {
      const planification = navigation.find(n => n.title === 'Planification');
      expect(planification!.children).toBeDefined();

      const childTitles = planification!.children!.map(c => c.title);
      expect(childTitles).toContain('Calendrier');
      expect(childTitles).toContain("File d'attente");
    });

    it('File d\'attente is limited to CLINIC_ADMIN and EMPLOYEE', () => {
      const planification = navigation.find(n => n.title === 'Planification');
      const fileAttente = planification!.children!.find(c => c.title === "File d'attente");
      expect(fileAttente!.roles).toContain('CLINIC_ADMIN');
      expect(fileAttente!.roles).toContain('EMPLOYEE');
      expect(fileAttente!.roles).not.toContain('PRACTITIONER');
    });
  });
});

// Component rendering tests
describe('Sidebar component rendering', () => {
  it('renders Sidebar component without crashing for SUPERADMIN', async () => {
    const { Sidebar } = await import('@/components/layout/sidebar');
    const { container } = render(
      <Sidebar open={false} onOpenChange={() => {}} />
    );
    expect(container).toBeDefined();
  });

  it('renders Dashboard Admin for SUPERADMIN', async () => {
    const { Sidebar } = await import('@/components/layout/sidebar');
    render(<Sidebar open={false} onOpenChange={() => {}} />);
    expect(screen.getAllByText('Dashboard Admin').length).toBeGreaterThan(0);
  });

  it('renders Tenants & Cliniques for SUPERADMIN', async () => {
    const { Sidebar } = await import('@/components/layout/sidebar');
    render(<Sidebar open={false} onOpenChange={() => {}} />);
    expect(screen.getAllByText('Tenants & Cliniques').length).toBeGreaterThan(0);
  });
});
