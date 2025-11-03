// Configuration des variables d'environnement pour les tests e2e
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

// Utilisons une configuration de base de données qui fonctionne en mémoire pour les tests
process.env.DATABASE_TYPE = 'sqlite';
process.env.DATABASE_MEMORY = 'true';

// Configurez ceci uniquement si vous avez besoin de vous connecter à une base de données réelle pour les tests
// process.env.DATABASE_HOST = 'localhost';
// process.env.DATABASE_PORT = '5432';
// process.env.DATABASE_USERNAME = 'postgres';
// process.env.DATABASE_PASSWORD = 'password';
// process.env.DATABASE_NAME = 'medical_test';

// Configurer d'autres variables d'environnement si nécessaire 

// Exporter une fonction pour que ce fichier soit considéré comme un module
export function setupTestEnv() {
  // Cette fonction ne fait rien car la configuration est déjà appliquée
  return true;
} 