#!/bin/bash

# Script de configuration PM2 pour Medical Backend
# À exécuter depuis /var/www/medicalBackend

set -e

echo "🚀 Configuration PM2 pour Medical Backend"
echo "=========================================="

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier du projet (/var/www/medicalBackend)"
    exit 1
fi

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    pnpm add -g pm2
else
    echo "✅ PM2 est déjà installé ($(pm2 --version))"
fi

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p logs
mkdir -p uploads

# Créer le fichier de configuration PM2
echo "📋 Création du fichier de configuration PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'medical-backend-dev',
      script: 'pnpm',
      args: 'run start:dev',
      cwd: '/var/www/medicalBackend',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'dist', 'logs', '.git', 'uploads'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/dev-err.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'medical-backend-prod',
      script: 'dist/main.js',
      cwd: '/var/www/medicalBackend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/prod-err.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};
EOF

# Configuration du démarrage automatique
echo "⚙️ Configuration du démarrage automatique..."
pm2 startup || echo "⚠️ Veuillez exécuter la commande affichée ci-dessus avec sudo"

# Installation du module de rotation des logs
echo "📝 Configuration de la rotation des logs..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Créer les scripts de gestion
echo "🔧 Création des scripts de gestion..."

# Script de déploiement développement
cat > deploy-dev.sh << 'EOF'
#!/bin/bash
cd /var/www/medicalBackend

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
pnpm install

echo "🔄 Restarting development server with PM2..."
pm2 restart medical-backend-dev || pm2 start ecosystem.config.js --only medical-backend-dev

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Development deployment completed!"
echo "📊 Application status:"
pm2 status
echo ""
echo "📝 View logs with: pm2 logs medical-backend-dev"
EOF

# Script de déploiement production
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/medicalBackend

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building application..."
pnpm run build

echo "🔄 Restarting application with PM2..."
pm2 restart medical-backend-prod || pm2 start ecosystem.config.js --only medical-backend-prod

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment completed!"
echo "📊 Application status:"
pm2 status
EOF

# Script de monitoring
cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Medical Backend Status ==="
echo "PM2 Applications:"
pm2 status
echo ""
echo "MariaDB: $(systemctl is-active mariadb)"
echo "RabbitMQ: $(systemctl is-active rabbitmq-server)"
echo "MinIO: $(systemctl is-active minio)"
echo "Apache: $(systemctl is-active apache2)"
echo ""
echo "=== PM2 Application Logs (last 10 lines) ==="
pm2 logs --lines 10 --nostream
echo ""
echo "=== System Resources ==="
pm2 monit --no-interaction || echo "Use 'pm2 monit' for interactive monitoring"
EOF

# Script pour basculer entre dev et prod
cat > switch-mode.sh << 'EOF'
#!/bin/bash
cd /var/www/medicalBackend

if [ "$1" = "dev" ]; then
    echo "🔄 Switching to development mode..."
    pm2 stop medical-backend-prod 2>/dev/null || true
    pm2 start ecosystem.config.js --only medical-backend-dev
    echo "✅ Development mode activated"
    echo "📝 View logs with: pm2 logs medical-backend-dev"
elif [ "$1" = "prod" ]; then
    echo "🔄 Switching to production mode..."
    pm2 stop medical-backend-dev 2>/dev/null || true
    pnpm run build
    pm2 start ecosystem.config.js --only medical-backend-prod
    echo "✅ Production mode activated"
    echo "📝 View logs with: pm2 logs medical-backend-prod"
else
    echo "Usage: $0 [dev|prod]"
    echo "Current PM2 status:"
    pm2 status
fi

pm2 save
EOF

# Rendre les scripts exécutables
chmod +x deploy-dev.sh deploy.sh status.sh switch-mode.sh

echo ""
echo "✅ Configuration PM2 terminée !"
echo ""
echo "📋 Commandes utiles :"
echo "  Développement : ./switch-mode.sh dev"
echo "  Production    : ./switch-mode.sh prod"
echo "  Statut        : ./status.sh"
echo "  Logs          : pm2 logs"
echo "  Monitoring    : pm2 monit"
echo ""
echo "🔧 Scripts disponibles :"
echo "  ./deploy-dev.sh   - Déploiement développement"
echo "  ./deploy.sh       - Déploiement production"
echo "  ./status.sh       - Statut des services"
echo "  ./switch-mode.sh  - Basculer dev/prod"
echo ""
echo "🚀 Pour démarrer en mode développement :"
echo "  ./switch-mode.sh dev"
