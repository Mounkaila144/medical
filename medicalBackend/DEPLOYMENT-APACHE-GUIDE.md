 # Guide de Déploiement Apache - Application Médicale

Ce guide vous explique comment déployer votre application médicale avec Apache comme reverse proxy sur votre VPS Ubuntu.

## 📋 Prérequis

- **Ubuntu 20.04 LTS ou plus récent**
- **Apache2 déjà installé et configuré**
- **Docker et Docker Compose installés**
- **Certificats SSL Let's Encrypt configurés**

## 🚀 Déploiement Rapide

### 1. Préparer Apache

```bash
# Activer les modules nécessaires
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl

# Redémarrer Apache
sudo systemctl restart apache2
```

### 2. Configurer les Virtual Hosts

```bash
# Copier les fichiers de configuration
sudo cp medical.nigerdev.com.conf /etc/apache2/sites-available/
sudo cp rabbitmq.nigerdev.com.conf /etc/apache2/sites-available/

# Activer les sites
sudo a2ensite medical.nigerdev.com.conf
sudo a2ensite rabbitmq.nigerdev.com.conf

# Tester la configuration
sudo apache2ctl configtest

# Recharger Apache
sudo systemctl reload apache2
```

### 3. Configurer DNS

Ajoutez ces enregistrements DNS :

```
medical.nigerdev.com    A    VOTRE_IP_SERVEUR
rabbitmq.nigerdev.com   A    VOTRE_IP_SERVEUR
```

### 4. Déployer l'application

```bash
# Configurer l'environnement
cp env.production.example .env
nano .env  # Modifier avec vos valeurs

# Lancer le déploiement
./deploy-apache.sh production
```

## 🔧 Configuration détaillée

### Structure des ports

Avec Apache, les services utilisent ces ports internes :

- **Application NestJS** : `127.0.0.1:3001` → `https://medical.nigerdev.com`
- **PostgreSQL** : `127.0.0.1:5433`
- **RabbitMQ AMQP** : `127.0.0.1:5673`
- **RabbitMQ Management** : `127.0.0.1:15673` → `https://rabbitmq.nigerdev.com`
- **MinIO API** : `127.0.0.1:9003`
- **MinIO Console** : `127.0.0.1:9004`

### Configuration Apache principale

Le fichier `medical.nigerdev.com.conf` configure :

- **Redirection HTTP → HTTPS**
- **Headers de sécurité**
- **Proxy vers l'application NestJS**
- **Support WebSockets**
- **Limite d'upload 50MB**
- **Logs dédiés**

### Sécurité

Les headers de sécurité configurés :

```apache
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

## 📊 Monitoring

### Vérifier le statut

```bash
# Statut Apache
sudo systemctl status apache2

# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Logs Apache
sudo tail -f /var/log/apache2/medical-*.log

# Logs application
docker-compose -f docker-compose.prod.yml logs -f app
```

### Tests de connectivité

```bash
# Test direct de l'application
curl http://127.0.0.1:3001/health

# Test via Apache
curl https://medical.nigerdev.com/health

# Test RabbitMQ
curl https://rabbitmq.nigerdev.com
```

## 🔄 Mise à jour

```bash
# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Mettre à jour le code
git pull origin main

# Redéployer
./deploy-apache.sh production
```

## 🆘 Dépannage

### Problèmes courants

1. **Erreur 502 Bad Gateway**
   ```bash
   # Vérifier que l'application est démarrée
   curl http://127.0.0.1:3001/health
   
   # Vérifier les logs Apache
   sudo tail -f /var/log/apache2/medical-error.log
   ```

2. **Certificat SSL invalide**
   ```bash
   # Renouveler le certificat
   sudo certbot renew
   sudo systemctl reload apache2
   ```

3. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   sudo netstat -tlnp | grep :3001
   
   # Arrêter les conteneurs
   docker-compose -f docker-compose.prod.yml down
   ```

### Logs importants

```bash
# Logs Apache
sudo tail -f /var/log/apache2/medical-error.log
sudo tail -f /var/log/apache2/medical-access.log

# Logs application
docker-compose -f docker-compose.prod.yml logs app

# Logs système
sudo journalctl -u apache2 -f
```

## 🔒 Sécurité avancée

### Restriction d'accès RabbitMQ

Pour sécuriser RabbitMQ Management, modifiez `rabbitmq.nigerdev.com.conf` :

```apache
<Location />
  AuthType Basic
  AuthName "RabbitMQ Management"
  AuthUserFile /etc/apache2/.htpasswd
  Require valid-user
</Location>
```

Créer le fichier de mots de passe :

```bash
sudo htpasswd -c /etc/apache2/.htpasswd admin
```

### Limitation de débit

Ajoutez dans la configuration Apache :

```apache
LoadModule evasive24_module modules/mod_evasive24.so

<IfModule mod_evasive24.c>
    DOSHashTableSize    2048
    DOSPageCount        10
    DOSPageInterval     1
    DOSSiteCount        50
    DOSSiteInterval     1
    DOSBlockingPeriod   600
</IfModule>
```

## 🌐 URLs d'accès

Après déploiement :

- **Application principale** : `https://medical.nigerdev.com`
- **RabbitMQ Management** : `https://rabbitmq.nigerdev.com`
- **Health Check** : `https://medical.nigerdev.com/health`

## 📈 Performance

### Optimisations Apache

Ajoutez dans `/etc/apache2/apache2.conf` :

```apache
# Compression
LoadModule deflate_module modules/mod_deflate.so
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache
LoadModule expires_module modules/mod_expires.so
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

**🎉 Votre application médicale est maintenant déployée avec Apache !**