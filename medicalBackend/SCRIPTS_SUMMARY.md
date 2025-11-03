# 🏥 Scripts de Réinitialisation de la Base de Données Médicale

## 📋 Résumé des Scripts Créés

Voici les scripts créés pour réinitialiser votre base de données avec les migrations TypeORM :

### 🎯 Script Principal
- **`reset-database.sh`** - Script principal avec menu interactif
  - Permet de choisir entre différentes méthodes
  - Interface utilisateur conviviale
  - Confirmations de sécurité
  - **NOUVEAU:** Option pour ajouter l'utilisateur administrateur

### 🔧 Scripts Spécialisés

1. **`reset-with-migrations.sh`** ⭐ **RECOMMANDÉ**
   - Utilise uniquement les migrations TypeORM officielles
   - Plus sûr pour la production
   - Crée les tables : `tenants`, `users`, `sessions`

2. **`reset-database-with-typeorm.sh`**
   - Utilise TypeORM synchronize pour créer toutes les tables
   - Active temporairement le mode développement
   - Crée toutes les tables définies dans les entités

3. **`init-tables.sql`**
   - Script SQL manuel avec toutes les tables
   - Schéma complet de l'application médicale
   - Données de test incluses

### 👤 Scripts Utilisateur Administrateur

- **`add-admin-user.sh`** ⭐ **NOUVEAU**
  - Ajoute l'utilisateur `mounkaila144@gmail.com`
  - Rôle: `SUPERADMIN`
  - Génère un hash bcrypt sécurisé
  - Crée un tenant si nécessaire

- **`test-admin-login.sh`** ⭐ **NOUVEAU**
  - Teste la connexion de l'administrateur
  - Vérifie l'accès local et public
  - Teste les endpoints protégés
  - Fournit des commandes de test manuelles

### 🧪 Scripts de Test
- **`test-database-reset.sh`**
  - Vérifie que la réinitialisation a fonctionné
  - Teste l'authentification générale
  - Valide la structure de la base de données

### 📚 Documentation
- **`DATABASE_RESET_README.md`** - Guide détaillé
- **`SCRIPTS_SUMMARY.md`** - Ce résumé

## 🚀 Utilisation Rapide

### Option 1: Menu Interactif
```bash
./reset-database.sh
```

### Option 2: Ligne de Commande
```bash
# Avec migrations (recommandé)
./reset-database.sh migrations

# Avec synchronisation complète
./reset-database.sh sync

# Ajouter l'utilisateur administrateur
./reset-database.sh adduser

# Test de la base de données
./reset-database.sh test
```

### Option 3: Scripts Individuels
```bash
# Ajouter l'utilisateur admin directement
./add-admin-user.sh

# Tester la connexion admin
./test-admin-login.sh
```

## 🔑 Utilisateurs Créés

### Utilisateur Administrateur Principal ⭐
- **Email:** `mounkaila144@gmail.com`
- **Mot de passe:** `mounkaila144`
- **Rôle:** `SUPERADMIN`
- **Tenant:** `admin-principal`

### Utilisateurs de Test (scripts de réinitialisation)
- **Tenant:** Clinique Exemple
  - Slug: `clinique-exemple`
  - ID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

- **Utilisateur Admin:**
  - Email: `admin@clinique-exemple.com`
  - Mot de passe: `password123`
  - Rôle: `CLINIC_ADMIN`

- **Utilisateur Employé:**
  - Email: `employee@clinique-exemple.com`
  - Mot de passe: `password123`
  - Rôle: `EMPLOYEE`

## 🎯 Recommandations

### Pour Créer Votre Utilisateur Admin
```bash
./reset-database.sh adduser
# ou
./add-admin-user.sh
```

### Pour le Développement
```bash
./reset-database.sh sync
```
- Crée toutes les tables nécessaires
- Inclut toutes les entités du projet

### Pour la Production
```bash
./reset-database.sh migrations
```
- Utilise les migrations officielles
- Plus sûr et prévisible

### Après Configuration
```bash
./test-admin-login.sh
```
- Teste votre connexion administrateur
- Vérifie l'accès aux endpoints

## 🔍 Test de l'API

### Test avec Votre Compte Admin
```bash
curl -X POST https://medical.nigerdev.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mounkaila144@gmail.com",
    "password": "mounkaila144",
    "tenantSlug": "admin-principal"
  }'
```

### Test avec les Comptes de Test
```bash
curl -X POST https://medical.nigerdev.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinique-exemple.com",
    "password": "password123",
    "tenantSlug": "clinique-exemple"
  }'
```

## ⚠️ Points Importants

1. **Sauvegarde** - Les scripts de réinitialisation suppriment complètement la base de données
2. **Utilisateur Admin** - Le script `add-admin-user.sh` peut être exécuté sans réinitialiser
3. **Downtime** - L'application sera indisponible pendant les réinitialisations
4. **Permissions** - Exécuter avec les bonnes permissions Docker
5. **Environnement** - Scripts conçus pour `/var/www/medicalBackend/`

## 🐛 Dépannage

### Erreur "Script non trouvé"
- Vérifiez que vous êtes dans le bon répertoire
- Vérifiez les permissions d'exécution : `chmod +x *.sh`

### Erreur de connexion Docker
- Vérifiez que les conteneurs sont en cours d'exécution
- Vérifiez les noms des conteneurs : `medical-app`, `medical-db`

### Problème de connexion administrateur
- Exécutez `./test-admin-login.sh` pour diagnostiquer
- Vérifiez que l'utilisateur existe dans la base de données
- Testez d'abord en local puis en public

### Application ne démarre pas
- Vérifiez les logs : `docker-compose -f docker-compose.prod.yml logs app`
- Attendez quelques minutes pour le démarrage complet

## 📞 Support

Si vous rencontrez des problèmes :

1. **Pour l'utilisateur admin :** `./test-admin-login.sh`
2. **Pour la base de données :** `./reset-database.sh test`
3. **Vérifiez les logs :** `docker-compose -f docker-compose.prod.yml logs app`
4. **Consultez la documentation :** `DATABASE_RESET_README.md`

## 🔄 Workflow Recommandé

1. **Première installation :**
   ```bash
   ./reset-database.sh sync    # Créer toutes les tables
   ./add-admin-user.sh         # Ajouter votre compte admin
   ./test-admin-login.sh       # Tester la connexion
   ```

2. **Mise à jour de production :**
   ```bash
   ./reset-database.sh migrations  # Utiliser les migrations
   ./add-admin-user.sh             # Recréer votre compte
   ```

3. **Dépannage :**
   ```bash
   ./test-admin-login.sh           # Tester la connexion
   ./reset-database.sh test        # Tester la base complète
   ```

---

✅ **Votre base de données est maintenant prête avec votre compte administrateur personnalisé !** 