#!/bin/bash

# Attendre que la base de données soit accessible
echo "En attente de la base de données PostgreSQL..."
until docker exec -it medical-db-1 pg_isready -U postgres; do
  echo "Attente de PostgreSQL..."
  sleep 2
done

# Créer la base de données si elle n'existe pas déjà
echo "Création de la base de données 'medical' si elle n'existe pas..."
docker exec -it medical-db-1 psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'medical'" | grep -q 1 || docker exec -it medical-db-1 psql -U postgres -c "CREATE DATABASE medical;"

echo "Base de données initialisée avec succès!" 