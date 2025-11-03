#!/bin/bash

# Script pour mettre à jour l'application depuis Git
# À exécuter sur le serveur après avoir pushé le build

set -e

# Configuration
PROJECT_PATH="/var/www/medicalBackend"  # Ajustez selon votre serveur
SERVICE_NAME="medical-backend"
BRANCH="main"  # ou master selon votre configuration

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🔄 Mise à jour de l'application depuis Git"
echo "=========================================="

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "$PROJECT_PATH/package.json" ]; then
    log_error "Projet non trouvé dans $PROJECT_PATH"
    echo "Recherche du projet..."
    
    # Chercher le projet
    FOUND_PATH=$(find /var/www /home /opt -name "package.json" -path "*medical*" 2>/dev/null | head -1 | dirname)
    
    if [ -n "$FOUND_PATH" ]; then
        log_info "Projet trouvé dans: $FOUND_PATH"
        PROJECT_PATH="$FOUND_PATH"
    else
        log_error "Impossible de trouver le projet"
        exit 1
    fi
fi

cd "$PROJECT_PATH"
log_info "Répertoire de travail: $(pwd)"

# Vérifier que c'est un repo Git
if [ ! -d ".git" ]; then
    log_error "Ce répertoire n'est pas un repository Git"
    exit 1
fi

# Afficher l'état actuel
log_info "État actuel du repository:"
echo "Branch: $(git branch --show-current)"
echo "Dernier commit: $(git log -1 --oneline)"

# Arrêter le service
log_info "Arrêt du service $SERVICE_NAME..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    systemctl stop "$SERVICE_NAME"
    log_success "Service arrêté"
else
    log_warning "Service déjà arrêté"
fi

# Sauvegarder les modifications locales (si il y en a)
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_warning "Modifications locales détectées, sauvegarde..."
    git stash push -m "Auto-stash before update $(date)"
fi

# Récupérer les dernières modifications
log_info "Récupération des dernières modifications..."
git fetch origin

# Vérifier s'il y a des mises à jour
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log_info "Aucune mise à jour disponible"
else
    log_info "Mise à jour disponible:"
    echo "Local:  $LOCAL_COMMIT"
    echo "Remote: $REMOTE_COMMIT"
    
    # Faire le pull
    log_info "Application des mises à jour..."
    git pull origin "$BRANCH"
    log_success "Mise à jour appliquée"
    
    # Afficher les changements
    echo ""
    echo "📋 Changements appliqués:"
    git log --oneline "$LOCAL_COMMIT..$REMOTE_COMMIT"
fi

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    log_error "Dossier 'dist' manquant après la mise à jour"
    log_info "Assurez-vous d'avoir inclus le build dans votre commit"
    exit 1
fi

log_success "Build trouvé dans le repository"

# Installer/mettre à jour les dépendances si package.json a changé
if git diff --name-only "$LOCAL_COMMIT" HEAD | grep -q "package.json\|package-lock.json\|pnpm-lock.yaml"; then
    log_info "package.json modifié, mise à jour des dépendances..."
    
    if command -v pnpm >/dev/null 2>&1; then
        pnpm install --prod
    else
        npm ci --only=production
    fi
    
    log_success "Dépendances mises à jour"
fi

# Configurer les permissions
log_info "Configuration des permissions..."
if [ "$(whoami)" = "root" ]; then
    chown -R medical:medical . 2>/dev/null || true
fi

# Redémarrer le service
log_info "Redémarrage du service $SERVICE_NAME..."
systemctl start "$SERVICE_NAME"

# Attendre un peu et vérifier
sleep 3

if systemctl is-active --quiet "$SERVICE_NAME"; then
    log_success "Service redémarré avec succès"
    
    # Afficher le statut
    echo ""
    echo "📊 Statut du service:"
    systemctl status "$SERVICE_NAME" --no-pager -l | head -10
    
else
    log_error "Échec du redémarrage du service"
    echo ""
    echo "🔍 Logs d'erreur:"
    journalctl -u "$SERVICE_NAME" -n 10 --no-pager
    exit 1
fi

# Test de santé (optionnel)
log_info "Test de l'application..."
sleep 2

if curl -f -s "http://localhost:3001/health" >/dev/null 2>&1; then
    log_success "✅ Application répond correctement"
elif curl -f -s "https://medical.nigerdev.com/health" >/dev/null 2>&1; then
    log_success "✅ Application accessible via HTTPS"
else
    log_warning "⚠️  Impossible de tester l'application, vérifiez manuellement"
fi

echo ""
log_success "🎉 Mise à jour terminée avec succès !"
echo ""
echo "📋 Résumé:"
echo "   • Repository mis à jour: ✅"
echo "   • Service redémarré: ✅"
echo "   • Application fonctionnelle: ✅"
echo ""
echo "🔍 Pour surveiller les logs:"
echo "   journalctl -u $SERVICE_NAME -f"
echo ""
echo "🌐 Application accessible sur:"
echo "   https://medical.nigerdev.com"
