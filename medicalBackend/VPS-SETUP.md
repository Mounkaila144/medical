# Guide d'installation sur serveur VPS Ubuntu

Ce document explique comment déployer **Medical Backend** sur un serveur VPS Ubuntu avec Apache, MariaDB, Node.js et pnpm déjà installés.

> Configuration testée sur Ubuntu 20.04/22.04 LTS

---

## 1. Prérequis (déjà installés)

✅ Node.js ≥ 18  
✅ npm  
✅ pnpm  
✅ Apache2  
✅ MariaDB  

Vérifiez les versions :
```bash
node --version
npm --version
pnpm --version
apache2 -v
mysql --version
```

---

## 2. Préparation du système

### 2.1 Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Installation des dépendances supplémentaires
```bash
# Outils de développement
sudo apt install -y build-essential git curl wget

# Modules Apache nécessaires
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers

# Redémarrer Apache
sudo systemctl restart apache2
```

---

## 3. Configuration de la base de données MariaDB

### 3.1 Sécurisation de MariaDB
```bash
sudo mysql_secure_installation
```

### 3.2 Création de la base de données
```bash
sudo mysql -u root -p
```

Dans le shell MySQL :
```sql
CREATE DATABASE medical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medical'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise';
GRANT ALL PRIVILEGES ON medical.* TO 'medical'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Installation de RabbitMQ

```bash
# Installation
sudo apt install -y rabbitmq-server

# Démarrage et activation au boot
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server

# Activation du plugin de management
sudo rabbitmq-plugins enable rabbitmq_management

# Création de l'utilisateur admin
sudo rabbitmqctl add_user admin VotreMotDePasseRabbitMQ
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# Suppression de l'utilisateur guest (sécurité)
sudo rabbitmqctl delete_user guest
```

Console web accessible sur : `http://votre-ip:15672`

---

## 5. Installation de MinIO

### 5.1 Téléchargement et installation
```bash
# Télécharger MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
sudo chmod +x minio
sudo mv minio /usr/local/bin/

# Télécharger MinIO Client
wget https://dl.min.io/client/mc/release/linux-amd64/mc
sudo chmod +x mc
sudo mv mc /usr/local/bin/
```

### 5.2 Configuration utilisateur et dossiers
```bash
# Créer utilisateur minio
sudo useradd -r -s /sbin/nologin minio

# Créer dossiers
sudo mkdir -p /opt/minio/data
sudo mkdir -p /etc/minio
sudo chown -R minio:minio /opt/minio
sudo chown minio:minio /etc/minio
```

### 5.3 Configuration MinIO
```bash
sudo tee /etc/minio/minio.conf > /dev/null <<EOF
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=VotreMotDePasseMinIOSecurise
MINIO_VOLUMES="/opt/minio/data"
MINIO_OPTS="--console-address :9001"
EOF

sudo chown minio:minio /etc/minio/minio.conf
sudo chmod 640 /etc/minio/minio.conf
```

### 5.4 Service systemd pour MinIO
```bash
sudo tee /etc/systemd/system/minio.service > /dev/null <<EOF
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/bin/minio

[Service]
WorkingDirectory=/usr/local/

User=minio
Group=minio
ProtectProc=invisible

EnvironmentFile=/etc/minio/minio.conf
ExecStartPre=/bin/bash -c "if [ -z \"\${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in /etc/minio/minio.conf\"; exit 1; fi"
ExecStart=/usr/local/bin/minio server \$MINIO_OPTS \$MINIO_VOLUMES

# Let systemd restart this service always
Restart=always

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536

# Specifies the maximum number of threads this process can create
TasksMax=infinity

# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
EOF
```

### 5.5 Démarrage de MinIO
```bash
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio

# Vérifier le statut
sudo systemctl status minio
```

### 5.6 Configuration du bucket
```bash
# Configurer l'alias
mc alias set myminio http://localhost:9000 minioadmin VotreMotDePasseMinIOSecurise

# Créer le bucket
mc mb myminio/uploads

# Définir la politique publique pour les uploads (optionnel)
mc policy set public myminio/uploads
```

---

## 6. Déploiement de l'application

### 6.1 Création de l'utilisateur applicatif
```bash
sudo useradd -m -s /bin/bash medical
sudo usermod -aG www-data medical
```

### 6.2 Clonage et installation
```bash
# Se connecter en tant qu'utilisateur medical
sudo su - medical

# Cloner le repository
git clone <url-du-repo> medicalBackend
cd medicalBackend

# Installation des dépendances avec pnpm
pnpm install

# Construction de l'application
pnpm run build
```

### 6.3 Configuration des variables d'environnement
```bash
# Créer le fichier .env
cat > .env << EOF
# Server
PORT=3001
NODE_ENV=production

# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=medical
DB_PASSWORD=VotreMotDePasseSecurise
DB_NAME=medical

# JWT (générez des clés sécurisées)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# RabbitMQ
RABBITMQ_URL=amqp://admin:VotreMotDePasseRabbitMQ@localhost:5672

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=VotreMotDePasseMinIOSecurise
EOF

# Sécuriser le fichier
chmod 600 .env
```

---

## 7. Configuration du service systemd

```bash
# Revenir en root
exit

# Créer le service systemd
sudo tee /etc/systemd/system/medical-backend.service > /dev/null <<EOF
[Unit]
Description=Medical Backend API
After=network.target mariadb.service rabbitmq-server.service minio.service
Wants=mariadb.service rabbitmq-server.service minio.service

[Service]
Type=simple
User=medical
WorkingDirectory=/home/medical/medicalBackend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=medical-backend

[Install]
WantedBy=multi-user.target
EOF
```

### 7.1 Activation du service
```bash
sudo systemctl daemon-reload
sudo systemctl enable medical-backend
sudo systemctl start medical-backend

# Vérifier le statut
sudo systemctl status medical-backend
```

---

## 8. Configuration Apache (déjà en place)

Votre configuration Apache dans `/etc/apache2/sites-available/medical.nigerdev.com.conf` est déjà correcte.

Assurez-vous que le site est activé :
```bash
sudo a2ensite medical.nigerdev.com.conf
sudo systemctl reload apache2
```

---

## 9. Configuration du pare-feu

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Ports internes (optionnel, pour debug)
# sudo ufw allow 3001/tcp    # Application
# sudo ufw allow 9000/tcp    # MinIO API
# sudo ufw allow 9001/tcp    # MinIO Console
# sudo ufw allow 15672/tcp   # RabbitMQ Management

sudo ufw --force enable
```

---

## 10. Scripts de gestion

### 10.1 Script de déploiement
```bash
sudo tee /home/medical/deploy.sh > /dev/null <<'EOF'
#!/bin/bash
cd /home/medical/medicalBackend

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building application..."
pnpm run build

echo "🔄 Restarting service..."
sudo systemctl restart medical-backend

echo "✅ Deployment completed!"
EOF

sudo chmod +x /home/medical/deploy.sh
sudo chown medical:medical /home/medical/deploy.sh
```

### 10.2 Script de monitoring
```bash
sudo tee /home/medical/status.sh > /dev/null <<'EOF'
#!/bin/bash
echo "=== Medical Backend Status ==="
echo "Application: $(systemctl is-active medical-backend)"
echo "MariaDB: $(systemctl is-active mariadb)"
echo "RabbitMQ: $(systemctl is-active rabbitmq-server)"
echo "MinIO: $(systemctl is-active minio)"
echo "Apache: $(systemctl is-active apache2)"
echo ""
echo "=== Application Logs (last 10 lines) ==="
sudo journalctl -u medical-backend -n 10 --no-pager
EOF

sudo chmod +x /home/medical/status.sh
sudo chown medical:medical /home/medical/status.sh
```

---

## 11. Maintenance et monitoring

### 11.1 Logs
```bash
# Logs de l'application
sudo journalctl -u medical-backend -f

# Logs Apache
sudo tail -f /var/log/apache2/medical-error.log
sudo tail -f /var/log/apache2/medical-access.log

# Logs système
sudo tail -f /var/log/syslog
```

### 11.2 Commandes utiles
```bash
# Redémarrer tous les services
sudo systemctl restart medical-backend mariadb rabbitmq-server minio apache2

# Vérifier l'état des services
sudo systemctl status medical-backend mariadb rabbitmq-server minio apache2

# Tester la connectivité
curl -I http://localhost:3001/health
curl -I https://medical.nigerdev.com/health
```

---

## 12. Sécurité supplémentaire

### 12.1 Fail2ban (protection SSH)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 12.2 Mise à jour automatique des certificats SSL
Votre certificat Let's Encrypt se renouvelle automatiquement via certbot.

### 12.3 Sauvegarde automatique
```bash
# Script de sauvegarde de la base de données
sudo tee /home/medical/backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/medical/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u medical -p'VotreMotDePasseSecurise' medical > $BACKUP_DIR/medical_$DATE.sql

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "medical_*.sql" -mtime +7 -delete

echo "Backup completed: medical_$DATE.sql"
EOF

sudo chmod +x /home/medical/backup.sh
sudo chown medical:medical /home/medical/backup.sh

# Ajouter au crontab pour sauvegarde quotidienne à 2h du matin
(crontab -u medical -l 2>/dev/null; echo "0 2 * * * /home/medical/backup.sh") | crontab -u medical -
```

---

## 13. Vérification finale

1. **Testez l'application** : `https://medical.nigerdev.com/health`
2. **Vérifiez les logs** : `sudo journalctl -u medical-backend -f`
3. **Testez les services** : `/home/medical/status.sh`

---

## 14. Dépannage des erreurs de compilation

Si vous rencontrez des erreurs de compilation TypeScript lors du build, utilisez le script de correction :

```bash
# Copier le script de correction
sudo cp fix-compilation-errors.sh /home/medical/
sudo chown medical:medical /home/medical/fix-compilation-errors.sh
sudo chmod +x /home/medical/fix-compilation-errors.sh

# Exécuter le script en tant qu'utilisateur medical
sudo su - medical
cd medicalBackend
../fix-compilation-errors.sh
```

### Erreurs courantes et solutions :

1. **Cannot find module '../../common/services/minio.service'**
   ```bash
   # Le script créera automatiquement le fichier manquant
   ./fix-compilation-errors.sh
   ```

2. **'PrescriptionItem' has no exported member**
   ```bash
   # Vérifier que le fichier prescription-item.entity.ts existe
   ls -la src/ehr/entities/prescription-item.entity.ts
   ```

3. **Cannot find module '../common/common.module'**
   ```bash
   # Le script créera le module common manquant
   ./fix-compilation-errors.sh
   ```

4. **Erreurs de cache TypeScript**
   ```bash
   # Nettoyer le cache et rebuilder
   rm -rf dist/ node_modules/.cache
   pnpm install
   pnpm run build
   ```

### Vérification post-correction :

```bash
# Tester la compilation
pnpm run build

# Si succès, redémarrer le service
sudo systemctl restart medical-backend
sudo systemctl status medical-backend

# Vérifier les logs
sudo journalctl -u medical-backend -f
```

---

🎉 **Votre application Medical Backend est maintenant déployée sur votre VPS Ubuntu !**

Pour les mises à jour futures, utilisez simplement : `/home/medical/deploy.sh`
