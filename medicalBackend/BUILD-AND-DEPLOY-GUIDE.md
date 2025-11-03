# Guide : Build Local et Déploiement sur Serveur

Ce guide explique comment compiler votre application localement et l'envoyer sur votre serveur VPS, évitant ainsi les problèmes de compilation sur le serveur.

## 🎯 Avantages de cette approche

✅ **Évite les erreurs de compilation sur le serveur**  
✅ **Plus rapide** (pas de compilation sur le serveur)  
✅ **Plus fiable** (environnement de build contrôlé)  
✅ **Moins de ressources utilisées sur le serveur**  

---

## 📋 Prérequis

### Sur votre machine locale :
- Node.js ≥ 18
- npm ou pnpm
- Accès SSH au serveur

### Sur le serveur :
- Services configurés (MariaDB, RabbitMQ, MinIO, Apache)
- Fichier `.env` configuré
- Service systemd `medical-backend` configuré

---

## 🚀 Méthode 1 : Déploiement complet automatisé

### 1. Configuration du script

Modifiez les variables dans `deploy-to-server.sh` :

```bash
# Configuration - MODIFIEZ CES VALEURS
SERVER_HOST="medical.nigerdev.com"  # votre domaine ou IP
SERVER_USER="root"                  # ou medical
SERVER_PATH="/var/www/medicalBackend"  # chemin sur le serveur
SERVER_SERVICE="medical-backend"    # nom du service systemd
```

### 2. Exécution

```bash
# Rendre le script exécutable
chmod +x deploy-to-server.sh

# Lancer le déploiement complet
./deploy-to-server.sh
```

**Ce script fait tout automatiquement :**
- Installe les dépendances locales
- Compile l'application
- Crée une archive
- L'envoie sur le serveur
- Installe les dépendances de production
- Redémarre le service
- Teste l'application

---

## 📦 Méthode 2 : Envoi du build uniquement

Si vous avez déjà compilé localement et voulez juste envoyer le build :

### 1. Build local

```bash
# Avec pnpm (recommandé)
pnpm install
pnpm run build

# Ou avec npm
npm install
npm run build
```

### 2. Configuration du script

Modifiez les variables dans `send-build-only.sh` :

```bash
SERVER_HOST="medical.nigerdev.com"
SERVER_USER="root"
SERVER_PATH="/var/www/medicalBackend"
SERVER_SERVICE="medical-backend"
```

### 3. Envoi

```bash
# Rendre le script exécutable
chmod +x send-build-only.sh

# Envoyer le build
./send-build-only.sh
```

---

## 🔧 Configuration SSH (première fois)

### 1. Générer une clé SSH (si pas déjà fait)

```bash
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```

### 2. Copier la clé sur le serveur

```bash
ssh-copy-id root@medical.nigerdev.com
```

### 3. Tester la connexion

```bash
ssh root@medical.nigerdev.com "echo 'Connexion OK'"
```

---

## 📁 Structure des fichiers sur le serveur

```
/var/www/medicalBackend/
├── dist/                 # Code compilé (envoyé depuis local)
├── node_modules/         # Dépendances de production
├── package.json          # Métadonnées du projet
├── .env                  # Configuration (À CRÉER MANUELLEMENT)
└── *.backup-*           # Sauvegardes automatiques
```

---

## ⚙️ Configuration du fichier .env sur le serveur

**Important :** Le fichier `.env` doit être créé manuellement sur le serveur avec vos vraies valeurs :

```bash
# Se connecter au serveur
ssh root@medical.nigerdev.com

# Aller dans le répertoire de l'application
cd /var/www/medicalBackend

# Créer le fichier .env
cat > .env << 'EOF'
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
JWT_ACCESS_SECRET=votre-clé-jwt-access-très-sécurisée
JWT_REFRESH_SECRET=votre-clé-jwt-refresh-très-sécurisée

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
chown medical:medical .env
```

---

## 🔍 Vérification et dépannage

### Vérifier le statut du service

```bash
ssh root@medical.nigerdev.com "systemctl status medical-backend"
```

### Voir les logs en temps réel

```bash
ssh root@medical.nigerdev.com "journalctl -u medical-backend -f"
```

### Tester l'application

```bash
# Test de santé
curl https://medical.nigerdev.com/health

# Ou directement sur le port 3001
curl http://medical.nigerdev.com:3001/health
```

### En cas de problème

```bash
# Redémarrer tous les services
ssh root@medical.nigerdev.com "systemctl restart mariadb rabbitmq-server minio medical-backend"

# Vérifier les logs d'erreur
ssh root@medical.nigerdev.com "journalctl -u medical-backend -n 20"
```

---

## 🔄 Workflow de développement recommandé

1. **Développement local** avec `npm run start:dev`
2. **Tests** avec `npm run test`
3. **Build local** avec `npm run build`
4. **Déploiement** avec `./deploy-to-server.sh`
5. **Vérification** de l'application en production

---

## 📝 Notes importantes

- **Sauvegardes automatiques** : Les scripts créent automatiquement des sauvegardes
- **Rollback** : En cas de problème, vous pouvez restaurer une sauvegarde
- **Sécurité** : Ne jamais commiter le fichier `.env` avec de vraies valeurs
- **Performance** : Cette méthode est plus rapide que la compilation sur serveur

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez la connexion SSH
2. Vérifiez que les services sont actifs sur le serveur
3. Consultez les logs avec `journalctl -u medical-backend -f`
4. Utilisez le script `diagnose-server.sh` pour un diagnostic complet

---

🎉 **Avec cette méthode, vous évitez complètement les erreurs de compilation TypeScript sur le serveur !**
