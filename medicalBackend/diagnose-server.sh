#!/bin/bash

# Script de diagnostic pour le serveur VPS
# À exécuter sur le serveur pour identifier les problèmes

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🔍 Diagnostic du serveur Medical Backend"
echo "========================================"

# 1. Vérifier l'emplacement du projet
log_info "1. Vérification de l'emplacement du projet..."

POSSIBLE_LOCATIONS=(
    "/var/www/medicalBackend"
    "/home/medical/medicalBackend"
    "/opt/medicalBackend"
    "/root/medicalBackend"
)

PROJECT_PATH=""
for location in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -d "$location" ] && [ -f "$location/package.json" ]; then
        PROJECT_PATH="$location"
        log_success "Projet trouvé dans: $PROJECT_PATH"
        break
    fi
done

if [ -z "$PROJECT_PATH" ]; then
    log_error "Projet non trouvé dans les emplacements standards"
    echo "Recherche dans tout le système..."
    find / -name "package.json" -path "*/medicalBackend/*" 2>/dev/null | head -5
    exit 1
fi

cd "$PROJECT_PATH"

# 2. Vérifier les versions des outils
log_info "2. Vérification des versions des outils..."

echo "Node.js: $(node --version 2>/dev/null || echo 'NON INSTALLÉ')"
echo "npm: $(npm --version 2>/dev/null || echo 'NON INSTALLÉ')"
echo "pnpm: $(pnpm --version 2>/dev/null || echo 'NON INSTALLÉ')"

# 3. Vérifier l'état des services
log_info "3. Vérification de l'état des services..."

services=("mariadb" "rabbitmq-server" "minio" "apache2" "medical-backend")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        log_success "$service: ACTIF"
    else
        log_error "$service: INACTIF"
    fi
done

# 4. Vérifier les fichiers manquants
log_info "4. Vérification des fichiers critiques..."

critical_files=(
    "src/common/services/minio.service.ts"
    "src/common/common.module.ts"
    "src/ehr/entities/prescription-item.entity.ts"
    "src/scheduling/dto/update-wait-queue-entry.dto.ts"
    "src/scheduling/controllers/wait-queue-test.controller.ts"
    "src/scheduling/controllers/test-simple.controller.ts"
    ".env"
    "package.json"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file: PRÉSENT"
    else
        log_error "$file: MANQUANT"
        missing_files+=("$file")
    fi
done

# 5. Vérifier les dépendances
log_info "5. Vérification des dépendances..."

if [ -d "node_modules" ]; then
    log_success "node_modules: PRÉSENT"
    
    # Vérifier quelques dépendances critiques
    critical_deps=("@nestjs/core" "typeorm" "mysql2" "minio" "amqplib")
    for dep in "${critical_deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            log_success "$dep: INSTALLÉ"
        else
            log_warning "$dep: MANQUANT"
        fi
    done
else
    log_error "node_modules: MANQUANT"
fi

# 6. Vérifier la configuration de la base de données
log_info "6. Vérification de la base de données..."

if [ -f ".env" ]; then
    DB_HOST=$(grep "^DB_HOST=" .env | cut -d'=' -f2 || echo "localhost")
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2 || echo "medical")
    DB_USER=$(grep "^DB_USERNAME=" .env | cut -d'=' -f2 || echo "root")
    
    echo "Host: $DB_HOST"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    
    # Tester la connexion à la base de données
    if command -v mysql >/dev/null 2>&1; then
        if mysql -h"$DB_HOST" -u"$DB_USER" -p"$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)" -e "USE $DB_NAME;" 2>/dev/null; then
            log_success "Connexion à la base de données: OK"
        else
            log_error "Connexion à la base de données: ÉCHEC"
        fi
    else
        log_warning "Client MySQL non disponible pour tester la connexion"
    fi
else
    log_error "Fichier .env manquant"
fi

# 7. Vérifier les ports
log_info "7. Vérification des ports..."

ports=("3001:Application" "3306:MariaDB" "5672:RabbitMQ" "9000:MinIO" "80:Apache" "443:Apache SSL")
for port_info in "${ports[@]}"; do
    port=$(echo "$port_info" | cut -d':' -f1)
    service=$(echo "$port_info" | cut -d':' -f2)
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        log_success "$service (port $port): ÉCOUTE"
    else
        log_warning "$service (port $port): N'ÉCOUTE PAS"
    fi
done

# 8. Vérifier les logs récents
log_info "8. Derniers logs de l'application..."

if systemctl is-active --quiet medical-backend; then
    echo "--- Dernières 5 lignes des logs ---"
    journalctl -u medical-backend -n 5 --no-pager
else
    log_warning "Service medical-backend non actif, impossible de récupérer les logs"
fi

# 9. Tester la compilation
log_info "9. Test de compilation..."

if [ ${#missing_files[@]} -eq 0 ]; then
    log_info "Tentative de compilation..."
    if timeout 60 pnpm run build >/dev/null 2>&1; then
        log_success "Compilation: RÉUSSIE"
    else
        log_error "Compilation: ÉCHEC"
        echo "Erreurs de compilation:"
        pnpm run build 2>&1 | grep -E "error TS[0-9]+:" | head -5
    fi
else
    log_warning "Fichiers manquants détectés, compilation ignorée"
fi

# 10. Résumé et recommandations
echo ""
echo "📋 RÉSUMÉ ET RECOMMANDATIONS"
echo "============================"

if [ ${#missing_files[@]} -gt 0 ]; then
    log_error "Fichiers manquants détectés:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "🔧 SOLUTION: Exécutez le script fix-compilation-errors.sh"
fi

if [ ! -d "node_modules" ]; then
    echo "🔧 SOLUTION: Installez les dépendances avec 'pnpm install'"
fi

if ! systemctl is-active --quiet medical-backend; then
    echo "🔧 SOLUTION: Démarrez le service avec 'sudo systemctl start medical-backend'"
fi

echo ""
echo "📍 Projet situé dans: $PROJECT_PATH"
echo "🔍 Pour plus de détails, consultez les logs avec:"
echo "   sudo journalctl -u medical-backend -f"
echo ""
echo "✅ Diagnostic terminé !"
