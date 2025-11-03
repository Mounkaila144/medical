# 🚀 Guide de Déploiement Rapide - Application Médicale

## ✅ Situation actuelle

Vous avez déjà :
- ✅ Serveur Ubuntu avec Apache configuré
- ✅ Certificats SSL Let's Encrypt
- ✅ Code cloné dans `/var/www/medicalBackend`
- ✅ Docker et Docker Compose installés

## 🔧 Étapes de déploiement

### 1. Configuration rapide

```bash
cd /var/www/medicalBackend

# Rendre les scripts exécutables
chmod +x quick-setup.sh deploy-apache.sh

# Lancer la configuration automatique
./quick-setup.sh
```

Ce script va :
- ✅ Corriger l'erreur Apache (LimitRequestBody)
- ✅ Créer le fichier `.env` avec des secrets sécurisés
- ✅ Activer les modules Apache nécessaires
- ✅ Créer les répertoires requis
- ✅ Vérifier que tout est prêt

### 2. Vérifier les DNS

Assurez-vous que ces domaines pointent vers votre serveur :

```bash
# Vérifier l'IP publique de votre serveur
curl ifconfig.me

# Les DNS doivent pointer vers cette IP :
# medical.nigerdev.com -> VOTRE_IP
# rabbitmq.nigerdev.com -> VOTRE_IP
```

### 3. Déploiement

```bash
# Lancer le déploiement complet
./deploy-apache.sh production
```

## 🌐 URLs d'accès

Après déploiement réussi :

- **Application** : https://medical.nigerdev.com
- **Health Check** : https://medical.nigerdev.com/health
- **RabbitMQ Management** : https://rabbitmq.nigerdev.com
- **API Documentation** : https://medical.nigerdev.com/api

## 🔍 Vérification

```bash
# Tester l'application directement
curl http://127.0.0.1:3001/health

# Tester via Apache
curl https://medical.nigerdev.com/health

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f app

# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 En cas de problème

### Erreur Apache "Syntax error"
```bash
# Vérifier la configuration
apache2ctl configtest

# Voir les logs Apache
tail -f /var/log/apache2/error.log
```

### Application non accessible
```bash
# Vérifier que l'app démarre
docker-compose -f docker-compose.prod.yml logs app

# Vérifier les ports
netstat -tlnp | grep :3001
```

### Base de données ne démarre pas
```bash
# Voir les logs de la DB
docker-compose -f docker-compose.prod.yml logs db

# Vérifier l'espace disque
df -h
```

## 📋 Commandes utiles

```bash
# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart app

# Voir tous les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter tout
docker-compose -f docker-compose.prod.yml down

# Redémarrer tout
docker-compose -f docker-compose.prod.yml up -d

# Nettoyer Docker
docker system prune -f
```

## 🔒 Sécurité

Le script `quick-setup.sh` génère automatiquement :
- 🔐 Mot de passe base de données sécurisé
- 🔐 Secrets JWT uniques
- 🔐 Mots de passe RabbitMQ et MinIO

Ces secrets sont stockés dans le fichier `.env` et ne doivent **jamais** être partagés.

## 📈 Monitoring

```bash
# Vérifier le statut complet
./check-status.sh

# Logs Apache
tail -f /var/log/apache2/medical-*.log

# Utilisation des ressources
docker stats
```

---

**🎉 Votre application médicale sera accessible sur https://medical.nigerdev.com !** 