// Configuration
import './setup-env';
export { setupTestEnv } from './setup-env';

// Modules de test
export * from './auth-test.module';
export * from './scheduling-test.module';

// Utilitaires de test
export const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const TEST_PATIENT_ID = '00000000-0000-0000-0000-000000000002';
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000003';

// Fonction utilitaire pour créer des dates
export function createTestDate(hoursFromNow: number): Date {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
}

// Fonction utilitaire pour créer un middleware d'authentification
export function createAuthMiddleware(tenantId = TEST_TENANT_ID, userId = TEST_USER_ID) {
  return (req, res, next) => {
    req.user = { tenantId, sub: userId };
    next();
  };
} 