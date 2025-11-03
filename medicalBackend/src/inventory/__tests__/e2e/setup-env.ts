// Configuration des variables d'environnement pour les tests e2e
process.env.JWT_ACCESS_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

// Utiliser une base de données en mémoire pour les tests
process.env.DATABASE_TYPE = 'sqlite';
process.env.DATABASE_MEMORY = 'true';

// Exporter une fonction pour que ce fichier soit considéré comme un module
export function setupTestEnv() {
  // Cette fonction ne fait rien car la configuration est déjà appliquée
  return true;
} 