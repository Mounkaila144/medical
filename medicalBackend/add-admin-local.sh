#!/bin/bash

# Script pour ajouter un utilisateur administrateur en local
# Usage: ./add-admin-local.sh

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

log "👤 Ajout de l'utilisateur administrateur en local..."

# Informations de l'utilisateur
USER_EMAIL="mounkaila144@gmail.com"
USER_PASSWORD="mounkaila144"
USER_FIRST_NAME="Mounkaila"
USER_LAST_NAME="Admin"
USER_ROLE="SUPERADMIN"

log "📧 Email: $USER_EMAIL"
log "👤 Nom: $USER_FIRST_NAME $USER_LAST_NAME"
log "🔑 Rôle: $USER_ROLE"

# Vérifier si l'application NestJS est en cours d'exécution
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    error "L'application NestJS ne semble pas démarrée sur http://localhost:3001. Démarrez-la d'abord avec 'PORT=3001 npm run start:dev'"
fi

log "🚀 Application détectée sur http://localhost:3001"

# Utiliser l'API pour créer l'utilisateur administrateur
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"firstName\": \"$USER_FIRST_NAME\",
    \"lastName\": \"$USER_LAST_NAME\",
    \"role\": \"$USER_ROLE\"
  }" 2>/dev/null || echo "ERROR")

if [[ "$AUTH_RESPONSE" == *"ERROR"* ]]; then
    warning "⚠️ Tentative via l'endpoint register échouée, essayons une approche directe..."
    
    # Créer directement via un script Node.js
    cat > create_admin.js << 'EOF'
const { execSync } = require('child_process');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Configuration de la base de données locale
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'medical_db'
};

async function createAdmin() {
    const userEmail = 'mounkaila144@gmail.com';
    const userPassword = 'mounkaila144';
    const passwordHash = await bcrypt.hash(userPassword, 12);
    const userId = uuidv4();
    
    // Vérifier si l'utilisateur existe
    const checkUserQuery = `
        SELECT COUNT(*) as count FROM users WHERE email = '${userEmail}';
    `;
    
    try {
        const result = execSync(`psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "${checkUserQuery}"`, 
                                {env: {...process.env, PGPASSWORD: DB_CONFIG.password}}).toString().trim();
        
        const userExists = parseInt(result) > 0;
        
        if (userExists) {
            console.log('⚠️ L\'utilisateur existe déjà. Mise à jour du mot de passe...');
            const updateQuery = `
                UPDATE users 
                SET "passwordHash" = '${passwordHash}', 
                    "updatedAt" = NOW(),
                    "role" = 'SUPERADMIN'
                WHERE email = '${userEmail}';
            `;
            
            execSync(`psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -c "${updateQuery}"`, 
                    {env: {...process.env, PGPASSWORD: DB_CONFIG.password}});
            
            console.log('✅ Mot de passe mis à jour avec succès!');
        } else {
            console.log('➕ Création du nouvel utilisateur...');
            
            // Créer un tenant par défaut s'il n'existe pas
            const tenantId = uuidv4();
            const createTenantQuery = `
                INSERT INTO tenants (id, name, slug, "isActive", "createdAt", "updatedAt") 
                VALUES ('${tenantId}', 'Administration Principale', 'admin-principal', true, NOW(), NOW())
                ON CONFLICT (slug) DO NOTHING;
            `;
            
            execSync(`psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -c "${createTenantQuery}"`, 
                    {env: {...process.env, PGPASSWORD: DB_CONFIG.password}});
            
            // Récupérer l'ID du tenant
            const getTenantQuery = `SELECT id FROM tenants WHERE slug = 'admin-principal' LIMIT 1;`;
            const tenantResult = execSync(`psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -t -c "${getTenantQuery}"`, 
                                        {env: {...process.env, PGPASSWORD: DB_CONFIG.password}}).toString().trim();
            
            const finalTenantId = tenantResult || tenantId;
            
            // Créer l'utilisateur
            const createUserQuery = `
                INSERT INTO users (
                    id, "tenantId", email, "passwordHash", role, 
                    "firstName", "lastName", "isActive", "createdAt", "updatedAt"
                ) VALUES (
                    '${userId}', '${finalTenantId}', '${userEmail}', '${passwordHash}', 'SUPERADMIN',
                    'Mounkaila', 'Admin', true, NOW(), NOW()
                );
            `;
            
            execSync(`psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.database} -c "${createUserQuery}"`, 
                    {env: {...process.env, PGPASSWORD: DB_CONFIG.password}});
            
            console.log('✅ Utilisateur créé avec succès!');
        }
        
        console.log('🔑 Identifiants de connexion:');
        console.log(`  Email: ${userEmail}`);
        console.log(`  Mot de passe: ${userPassword}`);
        console.log('  Tenant: admin-principal');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

createAdmin();
EOF
    
    # Exécuter le script Node.js
    node create_admin.js
    
    # Nettoyer le fichier temporaire
    rm create_admin.js
    
else
    log "✅ Utilisateur créé via l'API!"
fi

# Test de connexion
log "🧪 Test de connexion..."
sleep 2

TEST_LOGIN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"tenantSlug\": \"admin-principal\"
  }" 2>/dev/null || echo "ERROR")

if [[ "$TEST_LOGIN" == *"accessToken"* ]]; then
    log "✅ Test de connexion réussi!"
    info "🔑 Identifiants de connexion:"
    info "  Email: $USER_EMAIL"
    info "  Mot de passe: $USER_PASSWORD"
    info "  Tenant: admin-principal"
elif [[ "$TEST_LOGIN" == *"ERROR"* ]]; then
    warning "⚠️ Impossible de tester la connexion"
else
    warning "⚠️ Test de connexion échoué."
    info "Réponse: $TEST_LOGIN"
fi

log "🎉 Opération terminée!"
info "📝 Vous pouvez maintenant vous connecter avec:"
info "  Email: $USER_EMAIL"
info "  Mot de passe: $USER_PASSWORD"
info "  Frontend: http://localhost:3000" 