# Guide de Réinitialisation de la Base de Données

Ce guide explique les différentes méthodes disponibles pour supprimer et réinitialiser la base de données de l'application médicale.

## Options Disponibles

### 1. Réinitialisation avec Migrations TypeORM (Recommandé)
**Script:** `reset-with-migrations.sh`

Cette méthode utilise uniquement les migrations TypeORM existantes.

### 2. Réinitialisation avec TypeORM Synchronize  
**Script:** `reset-database-with-typeorm.sh`

Cette méthode active temporairement la synchronisation TypeORM pour créer toutes les tables.

## Utilisation

Pour réinitialiser avec les migrations :
```bash
./reset-with-migrations.sh
```

Pour réinitialiser avec synchronisation complète :
```bash
./reset-database-with-typeorm.sh
```

## Données de Test

Les scripts créent automatiquement :
- **Tenant:** Clinique Exemple (slug: clinique-exemple)
- **Admin:** admin@clinique-exemple.com / password123  
- **Employé:** employee@clinique-exemple.com / password123

## Prérequis

- Docker et Docker Compose installés
- Application déployée dans `/var/www/medicalBackend/`
- Conteneurs `medical-app` et `medical-db` en cours d'exécution 