#!/bin/bash

# Script pour envoyer uniquement le dossier dist/ vers le serveur
# À exécuter après avoir fait 'npm run build' localement

set -e

# Configuration - MODIFIEZ CES VALEURS
SERVER_HOST="medical.nigerdev.com"  # votre serveur
SERVER_USER="root"                  # utilisateur SSH
SERVER_PATH="/var/www/medicalBackend"  # chemin sur le serveur (à vérifier)
SERVER_SERVICE="medical-backend"    # nom du service systemd

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

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "📦 Envoi du build vers le serveur"
echo "================================="

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    log_error "Dossier 'dist' non trouvé. Exécutez d'abord 'npm run build' ou 'pnpm run build'"
    exit 1
fi

log_success "Dossier dist trouvé"

# Vérifier la connexion SSH
log_info "Test de connexion SSH..."
if ! ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'SSH OK'" >/dev/null 2>&1; then
    log_error "Impossible de se connecter au serveur $SERVER_USER@$SERVER_HOST"
    echo "Configurez votre clé SSH avec: ssh-copy-id $SERVER_USER@$SERVER_HOST"
    exit 1
fi

log_success "Connexion SSH OK"

# Créer l'archive du build
log_info "Création de l'archive..."
tar -czf dist-$(date +%Y%m%d-%H%M%S).tar.gz dist/
ARCHIVE_NAME="dist-$(date +%Y%m%d-%H%M%S).tar.gz"

# Envoyer l'archive
log_info "Envoi de l'archive vers le serveur..."
scp "$ARCHIVE_NAME" "$SERVER_USER@$SERVER_HOST:/tmp/"

# Déployer sur le serveur
log_info "Déploiement sur le serveur..."
ssh "$SERVER_USER@$SERVER_HOST" << EOF
set -e

echo "🔄 Mise à jour du build sur le serveur..."

# Arrêter le service
if systemctl is-active --quiet $SERVER_SERVICE; then
    echo "Arrêt du service..."
    systemctl stop $SERVER_SERVICE
fi

# Aller dans le répertoire de l'application
cd "$SERVER_PATH"

# Sauvegarder l'ancien build
if [ -d "dist" ]; then
    echo "Sauvegarde de l'ancien build..."
    mv dist dist.backup-\$(date +%Y%m%d-%H%M%S)
fi

# Extraire le nouveau build
echo "Extraction du nouveau build..."
tar -xzf "/tmp/$ARCHIVE_NAME"

# Nettoyer
rm -f "/tmp/$ARCHIVE_NAME"

# Configurer les permissions
if [ "$SERVER_USER" = "root" ]; then
    chown -R medical:medical dist/ 2>/dev/null || true
fi

echo "✅ Build mis à jour"
EOF

# Redémarrer le service
log_info "Redémarrage du service..."
ssh "$SERVER_USER@$SERVER_HOST" << EOF
echo "Redémarrage du service $SERVER_SERVICE..."
systemctl start $SERVER_SERVICE

sleep 3

if systemctl is-active --quiet $SERVER_SERVICE; then
    echo "✅ Service redémarré avec succès"
else
    echo "❌ Échec du redémarrage"
    echo "Logs d'erreur:"
    journalctl -u $SERVER_SERVICE -n 5 --no-pager
    exit 1
fi
EOF

# Test rapide
log_info "Test de l'application..."
sleep 2

if curl -f -s "https://$SERVER_HOST/health" >/dev/null 2>&1; then
    log_success "✅ Application accessible"
else
    log_error "⚠️  Application non accessible, vérifiez les logs"
fi

# Nettoyer
rm -f "$ARCHIVE_NAME"

echo ""
log_success "🎉 Build envoyé et déployé avec succès !"
echo ""
echo "🔍 Pour voir les logs:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'journalctl -u $SERVER_SERVICE -f'"
