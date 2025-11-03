#!/bin/bash

# Script de déploiement - Build local et envoi vers le serveur
# À exécuter depuis votre machine locale

set -e

# Configuration - MODIFIEZ CES VALEURS
SERVER_HOST="medical.nigerdev.com"  # ou l'IP de votre serveur
SERVER_USER="root"                  # ou medical
SERVER_PATH="/var/www/medicalBackend"  # chemin sur le serveur
SERVER_SERVICE="medical-backend"    # nom du service systemd

# Couleurs pour les messages
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

echo "🚀 Déploiement Medical Backend vers le serveur"
echo "=============================================="

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet medicalBackend"
    exit 1
fi

# 1. Nettoyer et installer les dépendances
log_info "1. Installation des dépendances locales..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm install
else
    npm install
fi

# 2. Build local
log_info "2. Compilation locale..."
rm -rf dist/
if command -v pnpm >/dev/null 2>&1; then
    pnpm run build
else
    npm run build
fi

if [ ! -d "dist" ]; then
    log_error "La compilation a échoué - dossier dist non créé"
    exit 1
fi

log_success "Compilation locale réussie"

# 3. Créer l'archive de déploiement
log_info "3. Création de l'archive de déploiement..."

# Créer un dossier temporaire pour le déploiement
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copier les fichiers nécessaires
cp -r dist/ "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp pnpm-lock.yaml "$DEPLOY_DIR/" 2>/dev/null || true

# Copier les fichiers de configuration (sans les secrets)
if [ -f ".env.production" ]; then
    cp .env.production "$DEPLOY_DIR/.env"
    log_info "Fichier .env.production copié"
elif [ -f "env.production.example" ]; then
    cp env.production.example "$DEPLOY_DIR/.env.example"
    log_warning "Copiez env.production.example vers .env et configurez-le sur le serveur"
fi

# Créer l'archive
tar -czf "${DEPLOY_DIR}.tar.gz" "$DEPLOY_DIR"
log_success "Archive créée: ${DEPLOY_DIR}.tar.gz"

# 4. Envoyer vers le serveur
log_info "4. Envoi vers le serveur..."

# Vérifier la connexion SSH
if ! ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'Connexion SSH OK'" >/dev/null 2>&1; then
    log_error "Impossible de se connecter au serveur $SERVER_USER@$SERVER_HOST"
    log_info "Vérifiez votre configuration SSH ou utilisez:"
    echo "ssh-copy-id $SERVER_USER@$SERVER_HOST"
    exit 1
fi

# Envoyer l'archive
scp "${DEPLOY_DIR}.tar.gz" "$SERVER_USER@$SERVER_HOST:/tmp/"
log_success "Archive envoyée sur le serveur"

# 5. Déployer sur le serveur
log_info "5. Déploiement sur le serveur..."

ssh "$SERVER_USER@$SERVER_HOST" << EOF
set -e

echo "🔄 Déploiement en cours sur le serveur..."

# Arrêter le service
if systemctl is-active --quiet $SERVER_SERVICE; then
    echo "Arrêt du service $SERVER_SERVICE..."
    systemctl stop $SERVER_SERVICE
fi

# Sauvegarder l'ancienne version
if [ -d "$SERVER_PATH" ]; then
    echo "Sauvegarde de l'ancienne version..."
    mv "$SERVER_PATH" "${SERVER_PATH}.backup-\$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
fi

# Créer le répertoire de destination
mkdir -p "$SERVER_PATH"

# Extraire la nouvelle version
cd /tmp
tar -xzf "${DEPLOY_DIR}.tar.gz"
mv "${DEPLOY_DIR}"/* "$SERVER_PATH/"

# Nettoyer
rm -rf "${DEPLOY_DIR}" "${DEPLOY_DIR}.tar.gz"

# Aller dans le répertoire de l'application
cd "$SERVER_PATH"

# Installer les dépendances de production uniquement
echo "Installation des dépendances de production..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm install --prod --frozen-lockfile
else
    npm ci --only=production
fi

# Configurer les permissions
if [ "$SERVER_USER" = "root" ]; then
    chown -R medical:medical "$SERVER_PATH" 2>/dev/null || true
fi

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  ATTENTION: Fichier .env manquant !"
    echo "Copiez et configurez le fichier .env avant de démarrer le service"
    if [ -f ".env.example" ]; then
        echo "Exemple disponible dans .env.example"
    fi
else
    echo "✅ Fichier .env trouvé"
fi

echo "✅ Déploiement terminé"
EOF

# 6. Redémarrer le service
log_info "6. Redémarrage du service..."

ssh "$SERVER_USER@$SERVER_HOST" << EOF
# Redémarrer le service
echo "Redémarrage du service $SERVER_SERVICE..."
systemctl start $SERVER_SERVICE

# Attendre un peu
sleep 3

# Vérifier le statut
if systemctl is-active --quiet $SERVER_SERVICE; then
    echo "✅ Service $SERVER_SERVICE démarré avec succès"
    systemctl status $SERVER_SERVICE --no-pager -l
else
    echo "❌ Échec du démarrage du service"
    echo "Logs d'erreur:"
    journalctl -u $SERVER_SERVICE -n 10 --no-pager
    exit 1
fi
EOF

# 7. Test de santé
log_info "7. Test de santé de l'application..."

sleep 5  # Attendre que l'application démarre

if curl -f -s "https://$SERVER_HOST/health" >/dev/null 2>&1; then
    log_success "✅ Application accessible sur https://$SERVER_HOST/health"
elif curl -f -s "http://$SERVER_HOST:3001/health" >/dev/null 2>&1; then
    log_success "✅ Application accessible sur http://$SERVER_HOST:3001/health"
else
    log_warning "⚠️  Impossible de vérifier la santé de l'application"
    log_info "Vérifiez manuellement avec:"
    echo "curl https://$SERVER_HOST/health"
fi

# Nettoyer les fichiers locaux
log_info "8. Nettoyage..."
rm -rf "$DEPLOY_DIR" "${DEPLOY_DIR}.tar.gz"

echo ""
log_success "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Résumé:"
echo "   • Build local: ✅"
echo "   • Envoi vers serveur: ✅"
echo "   • Installation: ✅"
echo "   • Service redémarré: ✅"
echo ""
echo "🔍 Pour surveiller les logs:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'journalctl -u $SERVER_SERVICE -f'"
echo ""
echo "🌐 Application accessible sur:"
echo "   https://$SERVER_HOST"
