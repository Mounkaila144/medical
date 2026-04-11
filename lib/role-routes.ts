export const ROLE_ROUTES: Record<string, string[]> = {
  SUPERADMIN: ['/admin'],
  CLINIC_ADMIN: ['/dashboard', '/patients', '/practitioners', '/encounters', '/appointments', '/billing', '/accounting', '/reports', '/queue', '/admin/users', '/profile'],
  EMPLOYEE: ['/dashboard', '/patients', '/appointments', '/queue', '/accounting/invoices', '/profile'],
  PRACTITIONER: ['/practitioner', '/patients', '/encounters', '/appointments', '/profile'],
  ACCOUNTANT: ['/accounting', '/profile'],
};

export const ROLE_DASHBOARD: Record<string, string> = {
  SUPERADMIN: '/admin/dashboard',
  CLINIC_ADMIN: '/dashboard',
  EMPLOYEE: '/dashboard',
  PRACTITIONER: '/practitioner/dashboard',
  ACCOUNTANT: '/accounting/dashboard',
};
