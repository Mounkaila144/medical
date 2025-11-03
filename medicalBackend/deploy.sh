#!/bin/bash

# Script de déploiement pour l'application médicale
# Usage: ./deploy.sh [environment]
# Exemple: ./deploy.sh production

set -e  # Arrêter le script en cas d'erreur

# Variables
ENVIRONMENT=${1:-production}
PROJECT_NAME="medical-app"
BACKUP_DIR="/opt/backups/medical"
LOG_FILE="/var/log/medical-deploy.log"

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
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé. Veuillez l'installer d'abord."
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
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
    
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log/medical
    sudo mkdir -p /opt/medical/ssl
    
    # Créer le répertoire de logs s'il n'existe pas
    sudo touch $LOG_FILE
    sudo chmod 666 $LOG_FILE
    
    log "Répertoires créés"
}

# Sauvegarder la base de données
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Sauvegarde de la base de données..."
        
        BACKUP_FILE="$BACKUP_DIR/medical_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Vérifier si le conteneur de base de données existe
        if docker ps -a --format "table {{.Names}}" | grep -q "medical-db"; then
            docker exec medical-db pg_dump -U postgres medical > $BACKUP_FILE
            log "Sauvegarde créée: $BACKUP_FILE"
        else
            warning "Aucun conteneur de base de données trouvé, pas de sauvegarde"
        fi
    fi
}

# Arrêter les services existants
stop_services() {
    log "Arrêt des services existants..."
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down || true
    fi
    
    # Nettoyer les conteneurs orphelins
    docker container prune -f || true
    
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
        else
            error "Aucun fichier d'environnement trouvé"
        fi
    fi
    
    # Construire et démarrer
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log "Services démarrés"
}

# Vérifier la santé des services
check_health() {
    log "Vérification de la santé des services..."
    
    # Attendre que les services démarrent
    sleep 30
    
    # Vérifier l'application
    if curl -f http://localhost:3000/health &> /dev/null; then
        log "✅ Application accessible"
    else
        error "❌ Application non accessible"
    fi
    
    # Vérifier la base de données
    if docker exec medical-db pg_isready -U postgres &> /dev/null; then
        log "✅ Base de données accessible"
    else
        error "❌ Base de données non accessible"
    fi
    
    # Vérifier RabbitMQ
    if curl -f http://localhost:15672 &> /dev/null; then
        log "✅ RabbitMQ accessible"
    else
        warning "⚠️ RabbitMQ peut ne pas être accessible"
    fi
    
    log "Vérification de santé terminée"
}

# Nettoyer les ressources inutilisées
cleanup() {
    log "Nettoyage des ressources inutilisées..."
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    # Supprimer les volumes orphelins
    docker volume prune -f
    
    log "Nettoyage terminé"
}

# Afficher les informations de déploiement
show_info() {
    log "=== DÉPLOIEMENT TERMINÉ ==="
    info "Application: http://localhost:3000"
    info "RabbitMQ Management: http://localhost:15672"
    info "MinIO Console: http://localhost:9001"
    info "Logs: docker-compose -f docker-compose.prod.yml logs -f"
    info "Status: docker-compose -f docker-compose.prod.yml ps"
    log "=========================="
}

# Fonction principale
main() {
    log "Début du déploiement en mode $ENVIRONMENT"
    
    check_prerequisites
    create_directories
    backup_database
    stop_services
    start_services
    check_health
    cleanup
    show_info
    
    log "Déploiement terminé avec succès!"
}

# Gestion des signaux
trap 'error "Déploiement interrompu"' INT TERM

# Exécution
main "$@" 