#!/bin/bash

# Script de déploiement pour l'application médicale avec Apache
# Usage: ./deploy-apache.sh [environment]
# Exemple: ./deploy-apache.sh production

set -e  # Arrêter le script en cas d'erreur

# Variables
ENVIRONMENT=${1:-production}
PROJECT_NAME="medicalBackend"
BACKUP_DIR="/opt/backups/medical"
LOG_FILE="/var/log/medical-deploy.log"
APACHE_SITES_DIR="/etc/apache2/sites-available"
PROJECT_DIR="/var/www/medicalBackend"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    echo "[ERROR] $1" >> $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
    echo "[INFO] $1" >> $LOG_FILE
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier si on est dans le bon répertoire
    if [ ! -f "docker-compose.prod.yml" ]; then
        if [ -d "$PROJECT_DIR" ]; then
            log "Changement vers le répertoire du projet: $PROJECT_DIR"
            cd "$PROJECT_DIR"
        else
            error "Répertoire du projet non trouvé. Assurez-vous d'être dans $PROJECT_DIR"
        fi
    fi
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé. Veuillez l'installer d'abord."
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    fi
    
    # Vérifier Apache
    if ! systemctl is-active --quiet apache2; then
        error "Apache2 n'est pas en cours d'exécution. Veuillez le démarrer."
    fi
    
    # Vérifier les modules Apache nécessaires
    if ! apache2ctl -M | grep -q proxy_module; then
        warning "Module proxy non activé. Activation..."
        a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl
        systemctl reload apache2
    fi
    
    # Vérifier les permissions
    if ! docker ps &> /dev/null; then
        error "Impossible d'accéder à Docker. Vérifiez les permissions."
    fi
    
    log "Prérequis vérifiés avec succès"
}

# Créer les répertoires nécessaires
create_directories() {
    log "Création des répertoires nécessaires..."
    
    mkdir -p $BACKUP_DIR
    mkdir -p /var/log/medical
    
    # Créer le répertoire de logs s'il n'existe pas
    touch $LOG_FILE
    chmod 666 $LOG_FILE
    
    log "Répertoires créés"
}

# Configurer Apache
configure_apache() {
    log "Configuration d'Apache..."
    
    # Désactiver les sites existants s'ils sont activés (pour éviter les conflits)
    a2dissite medical.nigerdev.com.conf 2>/dev/null || true
    a2dissite rabbitmq.nigerdev.com.conf 2>/dev/null || true
    
    # Copier les fichiers de configuration Apache
    if [ -f "medical.nigerdev.com.conf" ]; then
        cp medical.nigerdev.com.conf $APACHE_SITES_DIR/
        log "Configuration medical.nigerdev.com copiée"
    else
        error "Fichier medical.nigerdev.com.conf non trouvé"
    fi
    
    if [ -f "rabbitmq.nigerdev.com.conf" ]; then
        cp rabbitmq.nigerdev.com.conf $APACHE_SITES_DIR/
        log "Configuration rabbitmq.nigerdev.com copiée"
    else
        warning "Fichier rabbitmq.nigerdev.com.conf non trouvé"
    fi
    
    # Tester la configuration Apache avant d'activer
    if apache2ctl configtest; then
        log "Configuration Apache valide"
        
        # Activer les sites
        a2ensite medical.nigerdev.com.conf
        if [ -f "$APACHE_SITES_DIR/rabbitmq.nigerdev.com.conf" ]; then
            a2ensite rabbitmq.nigerdev.com.conf
        fi
        
        systemctl reload apache2
        log "Apache rechargé avec succès"
    else
        error "Erreur dans la configuration Apache. Vérifiez les fichiers de configuration."
    fi
}

# Sauvegarder la base de données
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Sauvegarde de la base de données..."
        
        BACKUP_FILE="$BACKUP_DIR/medical_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Vérifier si le conteneur de base de données existe
        if docker ps -a --format "table {{.Names}}" | grep -q "medical-db"; then
            docker exec medical-db pg_dump -U postgres medical > $BACKUP_FILE 2>/dev/null || warning "Impossible de créer la sauvegarde"
            if [ -f "$BACKUP_FILE" ]; then
                log "Sauvegarde créée: $BACKUP_FILE"
            fi
        else
            warning "Aucun conteneur de base de données trouvé, pas de sauvegarde"
        fi
    fi
}

# Arrêter les services existants
stop_services() {
    log "Arrêt des services existants..."
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    fi
    
    # Nettoyer les conteneurs orphelins
    docker container prune -f 2>/dev/null || true
    
    log "Services arrêtés"
}

# Construire et démarrer les services
start_services() {
    log "Construction et démarrage des services..."
    
    # Copier le fichier d'environnement
    if [ ! -f ".env" ]; then
        if [ -f "env.production.example" ]; then
            cp env.production.example .env
            warning "Fichier .env créé à partir du template. Veuillez le configurer avec vos valeurs."
            info "Éditez le fichier .env avec: nano .env"
            info "Puis relancez le script."
            exit 1
        else
            error "Aucun fichier d'environnement trouvé"
        fi
    fi
    
    # Vérifier que les variables importantes sont définies
    if ! grep -q "DB_PASSWORD=" .env || ! grep -q "JWT_ACCESS_SECRET=" .env; then
        warning "Le fichier .env semble incomplet. Vérifiez les variables importantes."
    fi
    
    # Construire et démarrer
    log "Construction des images Docker..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    log "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Services démarrés"
}

# Vérifier la santé des services
check_health() {
    log "Vérification de la santé des services..."
    
    # Attendre que les services démarrent
    log "Attente du démarrage des services (60 secondes)..."
    sleep 60
    
    # Vérifier l'application directement
    log "Test de l'application en direct..."
    if curl -f -s http://127.0.0.1:3001/health &> /dev/null; then
        log "✅ Application accessible directement"
        
        # Tester via Apache
        if curl -f -s https://medical.nigerdev.com/health &> /dev/null; then
            log "✅ Application accessible via Apache (HTTPS)"
        elif curl -f -s http://medical.nigerdev.com/health &> /dev/null; then
            log "✅ Application accessible via Apache (HTTP)"
            warning "⚠️ HTTPS peut ne pas être configuré correctement"
        else
            warning "⚠️ Application non accessible via Apache - vérifiez la configuration DNS"
        fi
    else
        error "❌ Application non accessible directement sur le port 3001"
    fi
    
    # Vérifier la base de données
    if docker exec medical-db pg_isready -U postgres &> /dev/null; then
        log "✅ Base de données accessible"
    else
        warning "⚠️ Base de données peut ne pas être accessible"
    fi
    
    # Vérifier RabbitMQ
    if curl -f -s http://127.0.0.1:15673 &> /dev/null; then
        log "✅ RabbitMQ accessible"
    else
        warning "⚠️ RabbitMQ peut ne pas être accessible"
    fi
    
    # Afficher le statut des conteneurs
    log "Statut des conteneurs:"
    docker-compose -f docker-compose.prod.yml ps
    
    log "Vérification de santé terminée"
}

# Nettoyer les ressources inutilisées
cleanup() {
    log "Nettoyage des ressources inutilisées..."
    
    # Supprimer les images non utilisées
    docker image prune -f &> /dev/null || true
    
    # Supprimer les volumes orphelins
    docker volume prune -f &> /dev/null || true
    
    log "Nettoyage terminé"
}

# Afficher les informations de déploiement
show_info() {
    log "=== DÉPLOIEMENT TERMINÉ ==="
    info "🌐 URLs d'accès:"
    info "  Application: https://medical.nigerdev.com"
    info "  Application (direct): http://127.0.0.1:3001"
    info "  Health check: https://medical.nigerdev.com/health"
    info ""
    info "🔧 Services auxiliaires:"
    info "  RabbitMQ: https://rabbitmq.nigerdev.com"
    info "  RabbitMQ (direct): http://127.0.0.1:15673"
    info "  MinIO Console (direct): http://127.0.0.1:9004"
    info ""
    info "📋 Commandes utiles:"
    info "  Logs app: docker-compose -f docker-compose.prod.yml logs -f app"
    info "  Status: docker-compose -f docker-compose.prod.yml ps"
    info "  Apache logs: tail -f /var/log/apache2/medical-*.log"
    info "  Redémarrer: docker-compose -f docker-compose.prod.yml restart"
    log "=========================="
}

# Fonction principale
main() {
    log "🚀 Début du déploiement de $PROJECT_NAME en mode $ENVIRONMENT avec Apache"
    
    check_prerequisites
    create_directories
    configure_apache
    backup_database
    stop_services
    start_services
    check_health
    cleanup
    show_info
    
    log "✅ Déploiement terminé avec succès!"
}

# Gestion des signaux
trap 'error "❌ Déploiement interrompu"' INT TERM

# Exécution
main "$@" 