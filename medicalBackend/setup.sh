#!/bin/bash

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
  echo "Création du fichier .env..."
  cat > .env << EOL
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=medical

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
EOL
fi

# Démarrer les conteneurs Docker
echo "Démarrage des conteneurs Docker..."
docker-compose down
docker-compose up -d

# Attendre que la base de données soit accessible
echo "En attente de la base de données PostgreSQL..."
until docker exec -i medical-db-1 pg_isready -U postgres 2>/dev/null; do
  echo "Attente de PostgreSQL..."
  sleep 2
done

# Créer la base de données si elle n'existe pas déjà
echo "Création de la base de données 'medical' si elle n'existe pas..."
docker exec -i medical-db-1 psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'medical'" | grep -q 1 || docker exec -i medical-db-1 psql -U postgres -c "CREATE DATABASE medical;"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

echo "Configuration terminée !"
echo "Vous pouvez maintenant démarrer l'application avec: npm run start:dev" 