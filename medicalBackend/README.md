# Documentation Module Auth - Postman Collection

Cette collection Postman contient l'ensemble des endpoints du module d'authentification du monolithe NestJS Medical.

## Configuration

1. Importez le fichier `module-auth.postman_collection.json` dans Postman
2. Créez un environnement avec les variables suivantes :
   - `baseUrl` : URL de base de l'API (par défaut : http://localhost:3000)
   - `accessToken` : Sera automatiquement mis à jour lors de la connexion
   - `refreshToken` : Sera automatiquement mis à jour lors de la connexion
   - `tenantId` : Sera mis à jour après la création d'un tenant

## Fonctionnement des variables

Les variables `accessToken` et `refreshToken` sont automatiquement mises à jour lorsque vous exécutez les requêtes :
- Login
- Refresh Token

La variable `tenantId` est mise à jour après la création d'un tenant.

## Scénario d'utilisation

### 1. Connexion avec un superadmin

1. Exécutez la requête **Login** avec les identifiants d'un superadmin :
```json
{
    "email": "superadmin@medical.com",
    "password": "password123"
}
```

### 2. Création d'un tenant avec un admin

1. Avec le token du superadmin, exécutez la requête **Create Tenant** :
```json
{
    "name": "Clinique Exemple",
    "slug": "clinique-exemple",
    "adminEmail": "admin@clinique-exemple.com",
    "adminPassword": "password123",
    "adminFirstName": "Admin",
    "adminLastName": "Clinique"
}
```

### 3. Connexion avec l'admin de la clinique

1. Exécutez la requête **Login** avec les identifiants de l'admin créé :
```json
{
    "email": "admin@clinique-exemple.com",
    "password": "password123"
}
```

### 4. Création d'un employé

1. Avec le token de l'admin, exécutez la requête **Create User** :
```json
{
    "email": "employee@clinique-exemple.com",
    "password": "password123",
    "role": "EMPLOYEE",
    "firstName": "John",
    "lastName": "Doe"
}
```

### 5. Connexion avec l'employé

1. Exécutez la requête **Login** avec les identifiants de l'employé créé :
```json
{
    "email": "employee@clinique-exemple.com",
    "password": "password123"
}
```

## Liste des endpoints

### Auth
- **POST {{baseUrl}}/auth/login** - Authentification avec email et mot de passe
- **POST {{baseUrl}}/auth/refresh** - Rafraîchir le token d'accès
- **POST {{baseUrl}}/auth/logout** - Déconnexion et invalidation du token

### Admin (réservé aux superadmins)
- **POST {{baseUrl}}/admin/tenants** - Création d'un tenant avec son admin
- **PATCH {{baseUrl}}/admin/tenants/:id/deactivate** - Désactivation d'un tenant
- **PATCH {{baseUrl}}/admin/tenants/:id/reactivate** - Réactivation d'un tenant

### Users (réservé aux superadmins et admins de clinique)
- **POST {{baseUrl}}/users** - Création d'un utilisateur
- **PATCH {{baseUrl}}/users/:id/deactivate** - Désactivation d'un utilisateur

## Notes importantes

- Les administrateurs de clinique ne peuvent créer que des utilisateurs avec le rôle EMPLOYEE.
- Les administrateurs de clinique ne peuvent gérer que les utilisateurs de leur propre tenant.
- Seuls les superadmins peuvent créer, désactiver et réactiver des tenants.
