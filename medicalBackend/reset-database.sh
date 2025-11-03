#!/bin/bash

# Script principal de réinitialisation de la base de données
# Usage: ./reset-database.sh [option]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

title() {
    echo -e "${CYAN}$1${NC}"
}

show_help() {
    title "🏥 Script de Réinitialisation de la Base de Données Médicale"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options disponibles:"
    echo "  1, migrations    - Réinitialiser avec les migrations TypeORM (recommandé)"
    echo "  2, sync         - Réinitialiser avec TypeORM synchronize (toutes les tables)"
    echo "  3, sql          - Réinitialiser avec le script SQL manuel"
    echo "  4, adduser      - Ajouter l'utilisateur administrateur mounkaila144@gmail.com"
    echo "  test            - Tester la base de données après réinitialisation"
    echo "  help, -h        - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 1                    # Utiliser les migrations"
    echo "  $0 sync                 # Utiliser la synchronisation"
    echo "  $0 adduser              # Ajouter l'utilisateur admin"
    echo "  $0 test                 # Tester la base de données"
    echo ""
    echo "Si aucune option n'est fournie, un menu interactif sera affiché."
}

show_menu() {
    title "🏥 Réinitialisation de la Base de Données Médicale"
    echo ""
    echo "Choisissez une méthode de réinitialisation:"
    echo ""
    echo "1) 🔄 Migrations TypeORM (Recommandé)"
    echo "   - Utilise les migrations officielles du projet"
    echo "   - Plus sûr pour la production"
    echo "   - Crée uniquement les tables définies dans src/migrations/"
    echo ""
    echo "2) 🔧 TypeORM Synchronize (Complet)"
    echo "   - Crée toutes les tables à partir des entités"
    echo "   - Inclut toutes les relations et contraintes"
    echo "   - Modifie temporairement la configuration"
    echo ""
    echo "3) 📝 Script SQL Manuel"
    echo "   - Utilise le script SQL personnalisé"
    echo "   - Contrôle total sur le schéma"
    echo "   - Maintenance manuelle requise"
    echo ""
    echo "4) 👤 Ajouter Utilisateur Admin"
    echo "   - Ajouter mounkaila144@gmail.com comme SUPERADMIN"
    echo "   - Crée un tenant si nécessaire"
    echo ""
    echo "5) 🧪 Tester la base de données"
    echo "   - Vérifier l'état après réinitialisation"
    echo ""
    echo "6) ❌ Annuler"
    echo ""
}

run_migrations() {
    log "🔄 Réinitialisation avec les migrations TypeORM..."
    if [ -f "./reset-with-migrations.sh" ]; then
        ./reset-with-migrations.sh
    else
        error "Script reset-with-migrations.sh non trouvé"
    fi
}

run_sync() {
    log "🔧 Réinitialisation avec TypeORM synchronize..."
    if [ -f "./reset-database-with-typeorm.sh" ]; then
        ./reset-database-with-typeorm.sh
    else
        error "Script reset-database-with-typeorm.sh non trouvé"
    fi
}

run_sql() {
    log "📝 Réinitialisation avec le script SQL manuel..."
    
    # Vérifier si on est sur le serveur
    if [ ! -f "/var/www/medicalBackend/docker-compose.prod.yml" ]; then
        error "Ce script doit être exécuté sur le serveur dans /var/www/medicalBackend"
    fi
    
    cd /var/www/medicalBackend
    
    if [ ! -f "./init-tables.sql" ]; then
        error "Script init-tables.sql non trouvé"
    fi
    
    # Arrêter l'application
    log "⏹️ Arrêt de l'application..."
    docker-compose -f docker-compose.prod.yml stop app
    
    # Supprimer et recréer la base de données
    log "🗄️ Suppression de la base de données existante..."
    docker exec medical-db psql -U postgres -c "DROP DATABASE IF EXISTS medical;"
    
    log "🆕 Création d'une nouvelle base de données..."
    docker exec medical-db psql -U postgres -c "CREATE DATABASE medical;"
    
    # Exécuter le script SQL
    log "📝 Exécution du script SQL..."
    docker exec -i medical-db psql -U postgres -d medical < init-tables.sql
    
    # Redémarrer l'application
    log "🔄 Redémarrage de l'application..."
    docker-compose -f docker-compose.prod.yml start app
    
    log "✅ Réinitialisation SQL terminée!"
}

run_add_user() {
    log "👤 Ajout de l'utilisateur administrateur..."
    if [ -f "./add-admin-user.sh" ]; then
        ./add-admin-user.sh
    else
        error "Script add-admin-user.sh non trouvé"
    fi
}

run_test() {
    log "🧪 Test de la base de données..."
    if [ -f "./test-database-reset.sh" ]; then
        ./test-database-reset.sh
    else
        error "Script test-database-reset.sh non trouvé"
    fi
}

# Vérifier les arguments de ligne de commande
case "${1:-}" in
    "1"|"migrations")
        run_migrations
        exit 0
        ;;
    "2"|"sync")
        run_sync
        exit 0
        ;;
    "3"|"sql")
        run_sql
        exit 0
        ;;
    "4"|"adduser")
        run_add_user
        exit 0
        ;;
    "test")
        run_test
        exit 0
        ;;
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "")
        # Pas d'argument, afficher le menu interactif
        ;;
    *)
        error "Option invalide: $1. Utilisez '$0 help' pour voir les options disponibles."
        ;;
esac

# Menu interactif
while true; do
    show_menu
    read -p "Votre choix (1-6): " choice
    
    case $choice in
        1)
            echo ""
            warning "⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes!"
            read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " confirm
            if [[ $confirm == "oui" || $confirm == "o" || $confirm == "yes" || $confirm == "y" ]]; then
                run_migrations
                break
            else
                info "Opération annulée."
            fi
            ;;
        2)
            echo ""
            warning "⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes!"
            read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " confirm
            if [[ $confirm == "oui" || $confirm == "o" || $confirm == "yes" || $confirm == "y" ]]; then
                run_sync
                break
            else
                info "Opération annulée."
            fi
            ;;
        3)
            echo ""
            warning "⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes!"
            read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " confirm
            if [[ $confirm == "oui" || $confirm == "o" || $confirm == "yes" || $confirm == "y" ]]; then
                run_sql
                break
            else
                info "Opération annulée."
            fi
            ;;
        4)
            run_add_user
            break
            ;;
        5)
            run_test
            break
            ;;
        6)
            info "Opération annulée."
            exit 0
            ;;
        *)
            error "Choix invalide. Veuillez choisir entre 1 et 6."
            ;;
    esac
    echo ""
done

log "🎉 Opération terminée!" 