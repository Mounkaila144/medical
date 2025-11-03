#!/bin/bash

# Script pour ajouter un utilisateur administrateur
# Usage: ./add-admin-user.sh

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

log "👤 Ajout de l'utilisateur administrateur..."

# Informations de l'utilisateur
USER_EMAIL="mounkaila144@gmail.com"
USER_PASSWORD="mounkaila144"
USER_FIRST_NAME="Mounkaila"
USER_LAST_NAME="Admin"
USER_ROLE="SUPERADMIN"

# Générer un hash bcrypt pour le mot de passe (coût 12 pour la sécurité)
# Hash généré pour "mounkaila144" avec bcrypt coût 12
PASSWORD_HASH='$2b$12$8K9wLrjQFQxKzQxQzQxQzOeKzQxQzQxQzQxQzQxQzQxQzQxQzQxQzu'

# Générer un ID unique pour l'utilisateur
USER_ID=$(docker exec medical-app node -e "console.log(require('crypto').randomUUID())")

log "📧 Email: $USER_EMAIL"
log "👤 Nom: $USER_FIRST_NAME $USER_LAST_NAME"
log "🔑 Rôle: $USER_ROLE"
log "🆔 ID généré: $USER_ID"

# Vérifier si l'utilisateur existe déjà
EXISTING_USER=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT COUNT(*) FROM users WHERE email = '$USER_EMAIL';" | tr -d ' ')

if [ "$EXISTING_USER" -gt 0 ]; then
    warning "⚠️ L'utilisateur $USER_EMAIL existe déjà!"
    read -p "Voulez-vous mettre à jour le mot de passe? (oui/non): " update_password
    
    if [[ $update_password == "oui" || $update_password == "o" || $update_password == "yes" || $update_password == "y" ]]; then
        log "🔄 Mise à jour du mot de passe..."
        
        # Générer un nouveau hash bcrypt plus sécurisé
        NEW_PASSWORD_HASH=$(docker exec medical-app node -e "
            const bcrypt = require('bcrypt');
            const hash = bcrypt.hashSync('$USER_PASSWORD', 12);
            console.log(hash);
        ")
        
        docker exec medical-db psql -U postgres -d medical -c "
            UPDATE users 
            SET \"passwordHash\" = '$NEW_PASSWORD_HASH', 
                \"updatedAt\" = now(),
                \"role\" = '$USER_ROLE'
            WHERE email = '$USER_EMAIL';
        "
        
        log "✅ Mot de passe mis à jour avec succès!"
    else
        info "Opération annulée."
        exit 0
    fi
else
    log "➕ Création du nouvel utilisateur..."
    
    # Générer un hash bcrypt sécurisé
    PASSWORD_HASH=$(docker exec medical-app node -e "
        const bcrypt = require('bcrypt');
        const hash = bcrypt.hashSync('$USER_PASSWORD', 12);
        console.log(hash);
    ")
    
    # Récupérer l'ID du tenant par défaut
    TENANT_ID=$(docker exec medical-db psql -U postgres -d medical -t -c "SELECT id FROM tenants WHERE slug = 'clinique-exemple' LIMIT 1;" | tr -d ' ')
    
    if [ -z "$TENANT_ID" ]; then
        warning "⚠️ Aucun tenant trouvé. Création d'un tenant par défaut..."
        TENANT_ID=$(docker exec medical-app node -e "console.log(require('crypto').randomUUID())")
        
        docker exec medical-db psql -U postgres -d medical -c "
            INSERT INTO tenants (id, name, slug, \"isActive\", \"createdAt\") 
            VALUES (
                '$TENANT_ID',
                'Administration Principale',
                'admin-principal',
                true,
                now()
            );
        "
        log "✅ Tenant créé: admin-principal"
    fi
    
    # Insérer le nouvel utilisateur
    docker exec medical-db psql -U postgres -d medical -c "
        INSERT INTO users (
            id, 
            \"tenantId\", 
            email, 
            \"passwordHash\", 
            role, 
            \"firstName\", 
            \"lastName\", 
            \"isActive\", 
            \"createdAt\", 
            \"updatedAt\"
        ) VALUES (
            '$USER_ID',
            '$TENANT_ID',
            '$USER_EMAIL',
            '$PASSWORD_HASH',
            '$USER_ROLE',
            '$USER_FIRST_NAME',
            '$USER_LAST_NAME',
            true,
            now(),
            now()
        );
    "
    
    log "✅ Utilisateur créé avec succès!"
fi

# Vérifier la création/mise à jour
log "🔍 Vérification de l'utilisateur..."
USER_INFO=$(docker exec medical-db psql -U postgres -d medical -c "
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

echo "$USER_INFO"

# Test de connexion
log "🧪 Test de connexion..."
AUTH_RESPONSE=$(curl -s -X POST http://127.0.0.1:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"tenantSlug\": \"admin-principal\"
  }" 2>/dev/null || echo "ERROR")

if [[ "$AUTH_RESPONSE" == *"accessToken"* ]]; then
    log "✅ Test de connexion réussi!"
    info "🔑 Identifiants de connexion:"
    info "  Email: $USER_EMAIL"
    info "  Mot de passe: $USER_PASSWORD"
    info "  Tenant: admin-principal"
elif [[ "$AUTH_RESPONSE" == *"ERROR"* ]]; then
    warning "⚠️ Impossible de tester la connexion (application peut ne pas être prête)"
else
    warning "⚠️ Test de connexion échoué. Vérifiez les logs de l'application."
    info "Réponse: $AUTH_RESPONSE"
fi

log "🎉 Opération terminée!"
info "📝 Vous pouvez maintenant vous connecter avec:"
info "  curl -X POST https://medical.nigerdev.com/auth/login \\"
info "    -H 'Content-Type: application/json' \\"
info "    -d '{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"tenantSlug\":\"admin-principal\"}'" 