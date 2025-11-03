#!/bin/bash

# Script pour supprimer et recréer la base de données avec TypeORM synchronize
# Usage: ./reset-database-with-typeorm.sh

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

log "🗑️ Suppression et recréation de la base de données avec TypeORM..."

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

# Modifier temporairement la configuration pour activer synchronize
log "⚙️ Activation temporaire de la synchronisation TypeORM..."

# Créer un fichier .env temporaire avec synchronize activé
cp .env .env.backup
cat > .env.temp << 'EOF'
NODE_ENV=development
DB_HOST=medical-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=medical
DATABASE_HOST=medical-db
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=medical
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-change-in-production
MINIO_ENDPOINT=medical-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=medical-documents
RABBITMQ_URL=amqp://guest:guest@medical-rabbitmq:5672
EOF

# Remplacer le fichier .env
mv .env.temp .env

# Compiler le projet TypeScript
log "🔨 Compilation du projet TypeScript..."
docker exec medical-app npm run build

# Redémarrer l'application avec synchronize activé
log "🔄 Redémarrage de l'application avec synchronisation..."
docker-compose -f docker-compose.prod.yml start app

# Attendre que l'application démarre et crée les tables
log "⏳ Attente de la création des tables (45 secondes)..."
sleep 45

# Vérifier que les tables ont été créées
log "🔍 Vérification de la création des tables..."
TABLES_COUNT=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLES_COUNT" -gt 0 ]; then
    log "✅ $TABLES_COUNT tables créées avec succès!"
else
    error "❌ Aucune table créée. Vérifiez les logs de l'application."
fi

# Arrêter l'application pour insérer les données de test
log "⏹️ Arrêt temporaire pour insertion des données de test..."
docker-compose -f docker-compose.prod.yml stop app

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

-- Insérer un praticien de test (si la table existe)
INSERT INTO "practitioners" ("id", "tenantId", "firstName", "lastName", "specialty", "color") 
VALUES (
  'c47ac10b-58cc-4372-a567-0e02b2c3d482', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Dr. Jean', 
  'Martin', 
  'Médecine Générale', 
  '#3498db'
) ON CONFLICT DO NOTHING;
EOF

# Restaurer la configuration originale
log "🔧 Restauration de la configuration originale..."
mv .env.backup .env

# Redémarrer l'application avec la configuration de production
log "🔄 Redémarrage final de l'application..."
docker-compose -f docker-compose.prod.yml start app

# Attendre que l'application démarre
log "⏳ Attente du démarrage final (30 secondes)..."
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

# Exécuter les migrations existantes si elles existent
log "🚀 Exécution des migrations TypeORM..."
docker exec medical-app npx typeorm migration:run -d dist/app.module.js || warning "Migrations non exécutées (normal si aucune migration n'existe)"

log "✅ Base de données réinitialisée avec succès!"
info "🔑 Utilisateurs de test créés:"
info "  Admin: admin@clinique-exemple.com / password123"
info "  Employé: employee@clinique-exemple.com / password123"
info "  Tenant: Clinique Exemple (slug: clinique-exemple)"

log "🎉 Réinitialisation terminée!" 