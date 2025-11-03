#!/bin/bash

# Script pour supprimer et recréer la base de données avec les migrations TypeORM
# Usage: ./reset-with-migrations.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Vérifier si on est sur le serveur
if [ ! -f "/var/www/medicalBackend/docker-compose.prod.yml" ]; then
    error "Ce script doit être exécuté sur le serveur dans /var/www/medicalBackend"
fi

cd /var/www/medicalBackend

log "🗑️ Suppression et recréation de la base de données avec les migrations..."

# Arrêter l'application
log "⏹️ Arrêt de l'application..."
docker-compose -f docker-compose.prod.yml stop app

# Supprimer complètement la base de données
log "🗄️ Suppression de la base de données existante..."
docker exec medical-db psql -U postgres -c "DROP DATABASE IF EXISTS medical;"

# Recréer la base de données
log "🆕 Création d'une nouvelle base de données..."
docker exec medical-db psql -U postgres -c "CREATE DATABASE medical;"

# Créer les extensions nécessaires
log "📦 Installation des extensions PostgreSQL..."
docker exec medical-db psql -U postgres -d medical -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Compiler le projet TypeScript
log "🔨 Compilation du projet TypeScript..."
docker exec medical-app npm run build

# Créer un fichier de configuration TypeORM pour les migrations
log "⚙️ Configuration de TypeORM pour les migrations..."
docker exec medical-app bash -c 'cat > typeorm.config.js << "EOF"
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: "postgres",
  host: "medical-db",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "medical",
  entities: [
    "dist/**/*.entity.js"
  ],
  migrations: [
    "dist/migrations/*.js"
  ],
  synchronize: false,
  logging: true,
});

module.exports = { AppDataSource };
EOF'

# Exécuter les migrations TypeORM
log "🚀 Exécution des migrations TypeORM..."
docker exec medical-app npx typeorm migration:run -d typeorm.config.js

# Créer des données de test
log "👤 Création des données de test..."
docker exec medical-db psql -U postgres -d medical << 'EOF'
-- Insérer un tenant de test
INSERT INTO "tenants" ("id", "name", "slug", "isActive", "createdAt") 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
  'Clinique Exemple', 
  'clinique-exemple', 
  true, 
  now()
) ON CONFLICT ("slug") DO NOTHING;

-- Insérer un utilisateur admin de test
-- Mot de passe: password123 (hashé avec bcrypt)
INSERT INTO "users" ("id", "tenantId", "email", "passwordHash", "role", "firstName", "lastName", "isActive", "createdAt", "updatedAt") 
VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d480', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'admin@clinique-exemple.com', 
  '$2b$10$EbPE/oY94rnv5qhdlI9ODORztSfEkd7fvqgZNWrixTANntO/O1N5m', 
  'CLINIC_ADMIN', 
  'Admin', 
  'Clinique', 
  true, 
  now(), 
  now()
) ON CONFLICT ("email") DO NOTHING;

-- Insérer un utilisateur employé de test
INSERT INTO "users" ("id", "tenantId", "email", "passwordHash", "role", "firstName", "lastName", "isActive", "createdAt", "updatedAt") 
VALUES (
  'b47ac10b-58cc-4372-a567-0e02b2c3d481', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'employee@clinique-exemple.com', 
  '$2b$10$EbPE/oY94rnv5qhdlI9ODORztSfEkd7fvqgZNWrixTANntO/O1N5m', 
  'EMPLOYEE', 
  'Employé', 
  'Test', 
  true, 
  now(), 
  now()
) ON CONFLICT ("email") DO NOTHING;
EOF

# Nettoyer le fichier de configuration temporaire
docker exec medical-app rm -f typeorm.config.js

# Redémarrer l'application
log "🔄 Redémarrage de l'application..."
docker-compose -f docker-compose.prod.yml start app

# Attendre que l'application démarre
log "⏳ Attente du démarrage de l'application (30 secondes)..."
sleep 30

# Vérifier que l'application fonctionne
log "🔍 Vérification de l'état de l'application..."
if curl -f -s http://127.0.0.1:3001/health &> /dev/null; then
    log "✅ Application accessible!"
else
    warning "⚠️ Application peut ne pas être encore prête, vérifiez les logs: docker-compose -f docker-compose.prod.yml logs app"
fi

# Afficher les tables créées
log "📋 Tables créées dans la base de données:"
docker exec medical-db psql -U postgres -d medical -c '\dt'

log "✅ Base de données réinitialisée avec succès!"
info "🔑 Utilisateurs de test créés:"
info "  Admin: admin@clinique-exemple.com / password123"
info "  Employé: employee@clinique-exemple.com / password123"
info "  Tenant: Clinique Exemple (slug: clinique-exemple)"

log "🎉 Réinitialisation terminée!" 