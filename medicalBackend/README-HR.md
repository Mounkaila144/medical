# Module HR - Documentation Postman

Cette collection Postman permet de tester les APIs du module HR (Ressources Humaines) du système médical.

## Prérequis

1. Installez [Postman](https://www.postman.com/downloads/)
2. Importez le fichier `HR-collection.json` dans Postman
3. Configurez les variables d'environnement:
   - `baseUrl`: URL de base de l'API (ex: https://api.medical.example.com/v1)
   - `token`: Votre token d'authentification JWT
   - `id`: ID d'une demande de congé à utiliser pour les tests
   - `period`: Période pour l'export de paie au format YYYY-MM (ex: 2023-11)

## Flux d'utilisation typique

### 1. Créer un membre du personnel

Utilisez la requête `Créer un membre du personnel` pour ajouter un nouveau collaborateur dans le système.

Cette requête permet d'enregistrer les informations personnelles, professionnelles et bancaires d'un employé.

### 2. Créer un shift (horaire de travail)

Utilisez la requête `Créer un shift` pour définir les horaires de travail d'un membre du personnel.

Exemple de payload pour un shift:
```json
{
    "staffId": "STAFF123456",
    "startAt": "2023-11-20T08:00:00Z", 
    "endAt": "2023-11-20T16:00:00Z",
    "location": "MAIN_CLINIC",
    "department": "GENERAL_MEDICINE",
    "notes": "Consultation et suivi patients",
    "breakDuration": 60
}
```

Les champs `startAt` et `endAt` définissent respectivement l'heure de début et de fin du shift au format ISO 8601.

### 3. Créer une demande de congé

Utilisez la requête `Créer une demande de congé` pour soumettre une demande d'absence.

Exemple de payload pour une demande de congé:
```json
{
    "staffId": "STAFF123456",
    "startDate": "2023-12-24",
    "endDate": "2023-12-31",
    "type": "ANNUAL_LEAVE",
    "reason": "Congés de fin d'année",
    "replacementStaffId": "STAFF789012",
    "notes": "Tous les patients ont été répartis entre les autres médecins"
}
```

Après avoir créé la demande de congé, récupérez l'ID retourné dans la réponse et mettez à jour la variable `id` dans vos variables d'environnement.

### 4. Approuver une demande de congé

Utilisez la requête `Approuver une demande de congé` pour valider ou rejeter une demande d'absence.

Cette action ne peut être effectuée que par un utilisateur ayant les droits d'administration RH.

### 5. Exporter la paie

Utilisez la requête `Exporter la paie` pour générer un rapport de paie pour une période donnée.

Assurez-vous que la variable `period` est définie dans vos variables d'environnement au format YYYY-MM (ex: 2023-11).

## Types de congés disponibles

Le système prend en charge plusieurs types de congés:
- `ANNUAL_LEAVE`: Congés annuels payés
- `SICK_LEAVE`: Arrêt maladie
- `MATERNITY_LEAVE`: Congé maternité
- `PATERNITY_LEAVE`: Congé paternité
- `UNPAID_LEAVE`: Congé sans solde
- `TRAINING`: Formation
- `OTHER`: Autre type d'absence

## Structure d'un horaire de travail (shift)

Un shift comprend les éléments suivants:
- `staffId`: Identifiant du membre du personnel
- `startAt`: Date et heure de début (format ISO 8601)
- `endAt`: Date et heure de fin (format ISO 8601)
- `location`: Lieu de travail
- `department`: Service ou département
- `notes`: Notes ou commentaires
- `breakDuration`: Durée de la pause en minutes 