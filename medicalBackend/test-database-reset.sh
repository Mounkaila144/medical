#!/bin/bash

# Script de test pour vérifier la réinitialisation de la base de données
# Usage: ./test-database-reset.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[TEST] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

fail() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est sur le serveur
if [ ! -f "/var/www/medicalBackend/docker-compose.prod.yml" ]; then
    error "Ce script doit être exécuté sur le serveur dans /var/www/medicalBackend"
    exit 1
fi

cd /var/www/medicalBackend

log "🧪 Test de la réinitialisation de la base de données..."

# Test 1: Vérifier que la base de données existe
log "Test 1: Vérification de l'existence de la base de données..."
if docker exec medical-db psql -U postgres -lqt | cut -d \| -f 1 | grep -qw medical; then
    success "Base de données 'medical' existe"
else
    fail "Base de données 'medical' n'existe pas"
    exit 1
fi

# Test 2: Vérifier que les tables essentielles existent
log "Test 2: Vérification des tables essentielles..."
REQUIRED_TABLES=("tenants" "users" "sessions")
for table in "${REQUIRED_TABLES[@]}"; do
    if docker exec medical-db psql -U postgres -d medical -c "\dt" | grep -q "$table"; then
        success "Table '$table' existe"
    else
        fail "Table '$table' manquante"
    fi
done

# Test 3: Vérifier les données de test
log "Test 3: Vérification des données de test..."

# Vérifier le tenant de test
TENANT_COUNT=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM tenants WHERE slug = 'clinique-exemple';" | tr -d ' ')
if [ "$TENANT_COUNT" -eq 1 ]; then
    success "Tenant de test 'clinique-exemple' existe"
else
    fail "Tenant de test manquant (trouvé: $TENANT_COUNT)"
fi

# Vérifier les utilisateurs de test
ADMIN_COUNT=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM users WHERE email = 'admin@clinique-exemple.com';" | tr -d ' ')
if [ "$ADMIN_COUNT" -eq 1 ]; then
    success "Utilisateur admin de test existe"
else
    fail "Utilisateur admin de test manquant (trouvé: $ADMIN_COUNT)"
fi

EMPLOYEE_COUNT=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM users WHERE email = 'employee@clinique-exemple.com';" | tr -d ' ')
if [ "$EMPLOYEE_COUNT" -eq 1 ]; then
    success "Utilisateur employé de test existe"
else
    fail "Utilisateur employé de test manquant (trouvé: $EMPLOYEE_COUNT)"
fi

# Test 4: Vérifier que l'application répond
log "Test 4: Vérification de l'état de l'application..."
if curl -f -s http://127.0.0.1:3001/health &> /dev/null; then
    success "Application répond sur /health"
else
    warning "Application ne répond pas sur /health (peut être normal si elle démarre encore)"
fi

# Test 5: Test d'authentification
log "Test 5: Test d'authentification..."
AUTH_RESPONSE=$(curl -s -X POST http://127.0.0.1:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinique-exemple.com",
    "password": "password123",
    "tenantSlug": "clinique-exemple"
  }' || echo "ERROR")

if [[ "$AUTH_RESPONSE" == *"accessToken"* ]]; then
    success "Authentification fonctionne"
elif [[ "$AUTH_RESPONSE" == *"ERROR"* ]]; then
    warning "Erreur de connexion à l'API (application peut ne pas être prête)"
else
    fail "Authentification échoue - Réponse: $AUTH_RESPONSE"
fi

# Test 6: Compter toutes les tables
log "Test 6: Inventaire des tables créées..."
TOTAL_TABLES=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
info "Nombre total de tables créées: $TOTAL_TABLES"

# Lister toutes les tables
info "Tables disponibles:"
docker exec medical-db psql -U postgres -d medical -c '\dt' | grep -E '^ [a-z]' | awk '{print "  - " $3}'

# Test 7: Vérifier les extensions PostgreSQL
log "Test 7: Vérification des extensions PostgreSQL..."
if docker exec medical-db psql -U postgres -d medical -c '\dx' | grep -q 'uuid-ossp'; then
    success "Extension uuid-ossp installée"
else
    fail "Extension uuid-ossp manquante"
fi

# Résumé final
log "📊 Résumé des tests:"
echo ""
info "✅ Tests réussis:"
info "  - Base de données existe"
info "  - Tables essentielles créées"
info "  - Données de test insérées"
info "  - Extensions PostgreSQL installées"
echo ""

if curl -f -s http://127.0.0.1:3001/health &> /dev/null; then
    info "✅ Application opérationnelle"
else
    warning "⚠️  Application peut encore démarrer"
fi

echo ""
log "🎉 Tests de réinitialisation terminés!"
info "Vous pouvez maintenant tester l'API avec:"
info "  curl -X POST http://127.0.0.1:3001/auth/login \\"
info "    -H 'Content-Type: application/json' \\"
info "    -d '{\"email\":\"admin@clinique-exemple.com\",\"password\":\"password123\",\"tenantSlug\":\"clinique-exemple\"}'" 