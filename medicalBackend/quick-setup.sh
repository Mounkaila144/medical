#!/bin/bash

# Script de configuration rapide pour l'application médicale
# Usage: ./quick-setup.sh

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
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

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "docker-compose.prod.yml" ]; then
    error "Ce script doit être exécuté depuis le répertoire /var/www/medicalBackend"
fi

log "🔧 Configuration rapide de l'application médicale"

# 1. Corriger la configuration Apache
log "1. Correction de la configuration Apache..."
if [ -f "medical.nigerdev.com.conf" ]; then
    # Vérifier s'il y a des commentaires inline problématiques
    if grep -q "LimitRequestBody.*#" medical.nigerdev.com.conf; then
        warning "Correction de la syntaxe Apache..."
        sed -i 's/LimitRequestBody 52428800.*$/LimitRequestBody 52428800/' medical.nigerdev.com.conf
    fi
    log "✅ Configuration Apache corrigée"
else
    error "Fichier medical.nigerdev.com.conf non trouvé"
fi

# 2. Créer le fichier .env s'il n'existe pas
log "2. Configuration du fichier d'environnement..."
if [ ! -f ".env" ]; then
    if [ -f "env.production.example" ]; then
        cp env.production.example .env
        log "✅ Fichier .env créé à partir du template"
        
        # Générer des secrets sécurisés
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        JWT_ACCESS_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
        JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
        RABBITMQ_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        MINIO_ACCESS_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-20)
        MINIO_SECRET_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-40)
        
        # Remplacer les valeurs par défaut
        sed -i "s/medical_secure_password_2024/$DB_PASSWORD/" .env
        sed -i "s/your_super_secret_jwt_access_key_2024_change_this_in_production/$JWT_ACCESS_SECRET/" .env
        sed -i "s/your_super_secret_jwt_refresh_key_2024_change_this_in_production/$JWT_REFRESH_SECRET/" .env
        sed -i "s/medical_rabbitmq_2024/$RABBITMQ_PASSWORD/" .env
        sed -i "s/medical_minio_access_2024/$MINIO_ACCESS_KEY/" .env
        sed -i "s/medical_minio_secret_2024/$MINIO_SECRET_KEY/" .env
        
        log "✅ Secrets sécurisés générés automatiquement"
    else
        error "Fichier env.production.example non trouvé"
    fi
else
    log "✅ Fichier .env existe déjà"
fi

# 3. Vérifier les modules Apache
log "3. Vérification des modules Apache..."
MODULES_TO_ENABLE="proxy proxy_http proxy_wstunnel headers rewrite ssl"
for module in $MODULES_TO_ENABLE; do
    if ! apache2ctl -M | grep -q "${module}_module"; then
        warning "Activation du module $module..."
        a2enmod $module
    fi
done
log "✅ Modules Apache vérifiés"

# 4. Tester la configuration Apache
log "4. Test de la configuration Apache..."
if apache2ctl configtest; then
    log "✅ Configuration Apache valide"
else
    error "❌ Erreur dans la configuration Apache"
fi

# 5. Créer les répertoires nécessaires
log "5. Création des répertoires..."
mkdir -p /opt/backups/medical
mkdir -p /var/log/medical
touch /var/log/medical-deploy.log
chmod 666 /var/log/medical-deploy.log
log "✅ Répertoires créés"

# 6. Vérifier Docker
log "6. Vérification de Docker..."
if ! docker --version &> /dev/null; then
    error "Docker n'est pas installé"
fi

if ! docker-compose --version &> /dev/null; then
    error "Docker Compose n'est pas installé"
fi

if ! docker ps &> /dev/null; then
    error "Impossible d'accéder à Docker. Vérifiez les permissions."
fi
log "✅ Docker opérationnel"

# 7. Afficher le résumé
log "📋 Configuration terminée !"
echo ""
info "🔐 Secrets générés automatiquement et stockés dans .env"
info "🌐 Votre application sera accessible sur: https://medical.nigerdev.com"
info "🔧 RabbitMQ sera accessible sur: https://rabbitmq.nigerdev.com"
echo ""
info "📝 Prochaines étapes:"
info "  1. Vérifiez que vos DNS pointent vers ce serveur:"
info "     medical.nigerdev.com -> $(curl -s ifconfig.me 2>/dev/null || echo 'VOTRE_IP')"
info "     rabbitmq.nigerdev.com -> $(curl -s ifconfig.me 2>/dev/null || echo 'VOTRE_IP')"
info ""
info "  2. Lancez le déploiement:"
info "     ./deploy-apache.sh production"
echo ""
log "✅ Prêt pour le déploiement !" 