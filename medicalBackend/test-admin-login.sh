#!/bin/bash

# Script de test pour la connexion de l'administrateur
# Usage: ./test-admin-login.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

title() {
    echo -e "${CYAN}$1${NC}"
}

# Informations de l'utilisateur à tester
USER_EMAIL="mounkaila144@gmail.com"
USER_PASSWORD="mounkaila144"
API_URL="https://medical.nigerdev.com"
LOCAL_URL="http://127.0.0.1:3001"

title "🧪 Test de Connexion Administrateur"
echo ""
info "👤 Utilisateur: $USER_EMAIL"
info "🔑 Mot de passe: $USER_PASSWORD"
echo ""

# Test 1: Vérifier que l'utilisateur existe dans la base de données
log "Test 1: Vérification de l'existence de l'utilisateur..."

if [ -f "/var/www/medicalBackend/docker-compose.prod.yml" ]; then
    cd /var/www/medicalBackend
    
    USER_EXISTS=$(docker exec medical-db psql -U postgres -d medical -t -c "
        SELECT COUNT(*) FROM users WHERE email = '$USER_EMAIL';
    " | tr -d ' ')
    
    if [ "$USER_EXISTS" -eq 1 ]; then
        success "Utilisateur trouvé dans la base de données"
        
        # Afficher les détails de l'utilisateur
        USER_DETAILS=$(docker exec medical-db psql -U postgres -d medical -c "
            SELECT 
                u.email, 
                u.\"firstName\", 
                u.\"lastName\", 
                u.role, 
                u.\"isActive\",
                t.name as tenant_name,
                t.slug as tenant_slug
            FROM users u 
            LEFT JOIN tenants t ON u.\"tenantId\" = t.id 
            WHERE u.email = '$USER_EMAIL';
        ")
        echo "$USER_DETAILS"
    else
        fail "Utilisateur non trouvé dans la base de données (trouvé: $USER_EXISTS)"
        info "💡 Exécutez './reset-database.sh adduser' pour créer l'utilisateur"
        exit 1
    fi
else
    warning "Non exécuté sur le serveur - test de base de données ignoré"
fi

# Test 2: Test de connexion en local
log "Test 2: Test de connexion en local..."

# Récupérer le slug du tenant
if [ -f "/var/www/medicalBackend/docker-compose.prod.yml" ]; then
    TENANT_SLUG=$(docker exec medical-db psql -U postgres -d medical -t -c "
        SELECT t.slug 
        FROM users u 
        JOIN tenants t ON u.\"tenantId\" = t.id 
        WHERE u.email = '$USER_EMAIL';
    " | tr -d ' ')
    
    if [ -z "$TENANT_SLUG" ]; then
        TENANT_SLUG="admin-principal"
        warning "Slug du tenant non trouvé, utilisation de: $TENANT_SLUG"
    else
        info "Slug du tenant trouvé: $TENANT_SLUG"
    fi
else
    TENANT_SLUG="admin-principal"
    info "Utilisation du slug par défaut: $TENANT_SLUG"
fi

LOCAL_AUTH_RESPONSE=$(curl -s -X POST $LOCAL_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"tenantSlug\": \"$TENANT_SLUG\"
  }" 2>/dev/null || echo "ERROR")

if [[ "$LOCAL_AUTH_RESPONSE" == *"accessToken"* ]]; then
    success "Connexion locale réussie"
    
    # Extraire le token pour des tests supplémentaires
    ACCESS_TOKEN=$(echo "$LOCAL_AUTH_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    info "Token d'accès obtenu: ${ACCESS_TOKEN:0:20}..."
    
elif [[ "$LOCAL_AUTH_RESPONSE" == *"ERROR"* ]]; then
    warning "Erreur de connexion locale (serveur peut ne pas être accessible)"
else
    fail "Connexion locale échouée"
    info "Réponse: $LOCAL_AUTH_RESPONSE"
fi

# Test 3: Test de connexion sur l'API publique
log "Test 3: Test de connexion sur l'API publique..."

PUBLIC_AUTH_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"tenantSlug\": \"$TENANT_SLUG\"
  }" 2>/dev/null || echo "ERROR")

if [[ "$PUBLIC_AUTH_RESPONSE" == *"accessToken"* ]]; then
    success "Connexion publique réussie"
    
    # Extraire le token
    PUBLIC_ACCESS_TOKEN=$(echo "$PUBLIC_AUTH_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    info "Token d'accès public obtenu: ${PUBLIC_ACCESS_TOKEN:0:20}..."
    
elif [[ "$PUBLIC_AUTH_RESPONSE" == *"ERROR"* ]]; then
    warning "Erreur de connexion publique (serveur peut ne pas être accessible)"
else
    fail "Connexion publique échouée"
    info "Réponse: $PUBLIC_AUTH_RESPONSE"
fi

# Test 4: Test d'accès à un endpoint protégé (si token disponible)
if [ ! -z "$PUBLIC_ACCESS_TOKEN" ]; then
    log "Test 4: Test d'accès à un endpoint protégé..."
    
    PROTECTED_RESPONSE=$(curl -s -X GET $API_URL/auth/profile \
      -H "Authorization: Bearer $PUBLIC_ACCESS_TOKEN" \
      -H "Content-Type: application/json" 2>/dev/null || echo "ERROR")
    
    if [[ "$PROTECTED_RESPONSE" == *"email"* ]]; then
        success "Accès aux endpoints protégés fonctionnel"
        info "Profil utilisateur récupéré"
    else
        warning "Accès aux endpoints protégés limité"
        info "Réponse: $PROTECTED_RESPONSE"
    fi
elif [ ! -z "$ACCESS_TOKEN" ]; then
    log "Test 4: Test d'accès à un endpoint protégé (local)..."
    
    PROTECTED_RESPONSE=$(curl -s -X GET $LOCAL_URL/auth/profile \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" 2>/dev/null || echo "ERROR")
    
    if [[ "$PROTECTED_RESPONSE" == *"email"* ]]; then
        success "Accès aux endpoints protégés fonctionnel (local)"
        info "Profil utilisateur récupéré"
    else
        warning "Accès aux endpoints protégés limité (local)"
        info "Réponse: $PROTECTED_RESPONSE"
    fi
else
    warning "Test 4: Aucun token disponible pour tester les endpoints protégés"
fi

# Résumé final
echo ""
title "📊 Résumé des Tests"
echo ""

if [ "$USER_EXISTS" -eq 1 ]; then
    success "✅ Utilisateur existe dans la base de données"
else
    fail "❌ Utilisateur manquant dans la base de données"
fi

if [[ "$LOCAL_AUTH_RESPONSE" == *"accessToken"* ]]; then
    success "✅ Connexion locale fonctionnelle"
else
    fail "❌ Connexion locale échouée"
fi

if [[ "$PUBLIC_AUTH_RESPONSE" == *"accessToken"* ]]; then
    success "✅ Connexion publique fonctionnelle"
else
    fail "❌ Connexion publique échouée"
fi

echo ""
info "🔑 Commandes de test manuelles:"
echo ""
info "Test local:"
echo "curl -X POST $LOCAL_URL/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"tenantSlug\":\"$TENANT_SLUG\"}'"
echo ""
info "Test public:"
echo "curl -X POST $API_URL/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"tenantSlug\":\"$TENANT_SLUG\"}'"

echo ""
log "�� Tests terminés!" 