# Guide d'installation native (macOS – Apple Silicon ou Intel)

Ce document explique comment configurer **Medical Backend** sans Docker : toutes les dépendances tournent directement sur votre machine.

> Les commandes sont données pour macOS avec Homebrew. Adaptez-les pour Linux/Windows si nécessaire.

---

## 1. Prérequis généraux

| Outil | Commande d'installation |
|-------|-------------------------|
| Homebrew | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Node JS ≥ 18 | `brew install node` |
| Git | `brew install git` |

Cloner le dépôt puis installer les dépendances NPM :

```bash
git clone <url-du-repo> medicalBackend
cd medicalBackend
npm install
```

---

## 2. Base de données : MySQL

1. Installer MySQL :
   ```bash
   brew install mysql
   brew services start mysql    # démarre MySQL au démarrage
   ```
2. Créer la base et l'utilisateur (exemple `root` sans mot de passe) :
   ```bash
   mysql -u root <<SQL
   CREATE DATABASE medical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   -- Facultatif : créer un utilisateur dédié
   -- CREATE USER 'medical'@'localhost' IDENTIFIED BY 'password';
   -- GRANT ALL PRIVILEGES ON medical.* TO 'medical'@'localhost';
   SQL
   ```
3. Variables d'environnement (`.env`) :
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root    # ou medical
   DB_PASSWORD=        # mot de passe si défini
   DB_NAME=medical
   ```

---

## 3. File d'attente : RabbitMQ

```bash
brew install rabbitmq
brew services start rabbitmq

# Créer l'utilisateur attendu par l'application
rabbitmqctl add_user admin admin
rabbitmqctl set_user_tags admin administrator
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

* Console web : http://localhost:15672 (admin / admin)
* URL AMQP : `amqp://admin:admin@localhost:5672`

---

## 4. Stockage objet : MinIO (compatible S3)

```bash
brew install minio/stable/minio minio/stable/mc

# Dossier de données
mkdir -p ~/minio-data

# Variables d'environnement (à ajouter à votre shell ou launchd)
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin

# Lancer en mode manuel
minio server ~/minio-data --console-address ":9001"

# Ou en service (tâche de fond)
brew services start minio
```

* Console web : http://localhost:9001 (minioadmin / minioadmin)
* Endpoint API : http://localhost:9000

Créer un bucket :

```bash
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc mb myminio/uploads
```

---

## 5. Variables d'environnement complètes

```env
# Server
PORT=3001
NODE_ENV=development

# DB (cf. section 2)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=medical

# JWT
JWT_ACCESS_SECRET=<votre_clé>
JWT_REFRESH_SECRET=<votre_clé>

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

Placez ce fichier `.env` à la racine du projet.

---

## 6. Construction et démarrage de l'application

```bash
# Compilation TypeScript → dist/
npm run build

# Mode développement (watch + reload)
npm run start:dev

# Mode production
NODE_ENV=production npm run start:prod
```

* Le serveur GraphQL/REST écoute sur `http://localhost:3001`.
* Les schémas GraphQL sont générés dans `src/schema.gql`.

---

## 7. (Optionnel) Migrations TypeORM

En dev, `synchronize=true` suffit. Pour la production :

```bash
# Générer une migration correspondant au schéma actuel
npx typeorm migration:generate -d src/migrations -n init-mysql
# Exécuter les migrations
npx typeorm migration:run
```

---

## 8. Tests

```bash
npm run test         # unitaires
npm run test:e2e     # end-to-end (SQLite en mémoire)
```

---

## 9. Résolution des problèmes

| Problème | Solution |
|-----------|----------|
| `Error: connect ECONNREFUSED localhost:5672` | RabbitMQ n'est pas lancé ou mauvais identifiants dans `.env`. |
| `AccessDenied: InvalidAccessKeyId` (MinIO) | Vérifiez `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` et le bucket. |
| `ER_ACCESS_DENIED_ERROR` (MySQL) | Mauvais couple utilisateur/mot de passe ou privilèges manquants. |

---

Vous êtes prêt ! 🎉 