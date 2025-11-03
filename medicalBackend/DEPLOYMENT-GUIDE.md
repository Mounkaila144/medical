# Guide de Déploiement - Application Médicale

Ce guide vous explique comment déployer votre application médicale NestJS sur un VPS Ubuntu avec Docker.

## 📋 Prérequis

### Sur votre VPS Ubuntu

1. **Ubuntu 20.04 LTS ou plus récent**
2. **Au moins 4GB de RAM** (8GB recommandé)
3. **20GB d'espace disque libre** minimum
4. **Accès root ou sudo**

### Logiciels requis

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installer des outils utiles
sudo apt install -y curl wget git htop
```

## 🚀 Déploiement Rapide

### 1. Cloner le projet

```bash
# Cloner votre repository
git clone <votre-repo-url> medical-app
cd medical-app
```

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp env.production.example .env

# Éditer le fichier .env avec vos valeurs
nano .env
```

**⚠️ IMPORTANT**: Changez absolument ces valeurs dans le fichier `.env`:

```bash
# Mots de passe sécurisés
DB_PASSWORD=votre_mot_de_passe_db_super_securise
JWT_ACCESS_SECRET=votre_secret_jwt_access_super_long_et_securise
JWT_REFRESH_SECRET=votre_secret_jwt_refresh_super_long_et_securise
RABBITMQ_PASSWORD=votre_mot_de_passe_rabbitmq_securise
MINIO_ACCESS_KEY=votre_cle_minio_securisee
MINIO_SECRET_KEY=votre_secret_minio_super_securise
```

### 3. Déploiement automatique

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh production
```

## 🔧 Déploiement Manuel

Si vous préférez déployer manuellement :

### 1. Construction et démarrage

```bash
# Construire et démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Vérifier le statut

```bash
# Voir le statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Configuration du Domaine (Optionnel)

### Avec Nginx et SSL

1. **Installer Certbot pour SSL gratuit**:

```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtenir un certificat SSL**:

```bash
sudo certbot --nginx -d votre-domaine.com
```

3. **Modifier nginx.conf** pour utiliser votre domaine:

```nginx
server_name votre-domaine.com;
ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
```

## 📊 Monitoring et Maintenance

### Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f app

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart app

# Voir l'utilisation des ressources
docker stats

# Sauvegarder la base de données
docker exec medical-db pg_dump -U postgres medical > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker exec -i medical-db psql -U postgres medical < backup_20241201.sql
```

### Surveillance des services

```bash
# Vérifier la santé de l'application
curl http://localhost:3000/health

# Vérifier PostgreSQL
docker exec medical-db pg_isready -U postgres

# Vérifier RabbitMQ
curl http://localhost:15672
```

## 🔒 Sécurité

### Firewall

```bash
# Configurer UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Temporaire pour les tests
```

### Mises à jour automatiques

```bash
# Installer unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🔄 Mise à jour de l'application

```bash
# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🆘 Dépannage

### Problèmes courants

1. **Port 3000 déjà utilisé**:
```bash
# Trouver le processus qui utilise le port
sudo lsof -i :3000
# Tuer le processus
sudo kill -9 <PID>
```

2. **Problème de permissions Docker**:
```bash
sudo usermod -aG docker $USER
# Redémarrer la session
```

3. **Manque d'espace disque**:
```bash
# Nettoyer Docker
docker system prune -a
docker volume prune
```

4. **Base de données ne démarre pas**:
```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs db
# Vérifier l'espace disque
df -h
```

### Logs importants

```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs app

# Logs de déploiement
tail -f /var/log/medical-deploy.log

# Logs système
sudo journalctl -u docker
```

## 📈 Performance

### Optimisations recommandées

1. **Augmenter les limites de fichiers**:
```bash
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

2. **Optimiser PostgreSQL** (dans docker-compose.prod.yml):
```yaml
environment:
  - POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
  - POSTGRES_MAX_CONNECTIONS=200
  - POSTGRES_SHARED_BUFFERS=256MB
```

## 🔗 URLs d'accès

Après déploiement, vos services seront accessibles sur :

- **Application principale**: `http://votre-ip:3000`
- **RabbitMQ Management**: `http://votre-ip:15672`
- **MinIO Console**: `http://votre-ip:9001`
- **Avec Nginx**: `http://votre-domaine.com`

## 📞 Support

En cas de problème :

1. Vérifiez les logs avec les commandes ci-dessus
2. Consultez la documentation Docker
3. Vérifiez que tous les services sont en cours d'exécution
4. Assurez-vous que les ports ne sont pas bloqués par le firewall

---

**🎉 Félicitations ! Votre application médicale est maintenant déployée en production !** 