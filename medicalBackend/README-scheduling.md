# Documentation Postman Module SCHEDULING

Cette collection Postman contient les requêtes API pour interagir avec le module de planification (scheduling) du monolithe NestJS Medical.

## Configuration requise

Avant d'utiliser cette collection, assurez-vous de configurer les variables d'environnement suivantes dans Postman :

| Variable | Description |
|----------|-------------|
| `baseUrl` | URL de base de l'API (ex: http://localhost:3000/api) |
| `accessToken` | Token d'authentification JWT obtenu via la collection AUTH |
| `practitionerId` | ID du praticien (défini automatiquement après création) |
| `patientId` | ID du patient (à obtenir via la collection PATIENTS) |
| `appointmentId` | ID du rendez-vous (défini automatiquement après création) |

## Flux d'utilisation typiques

### Flux 1: Gestion des praticiens et de leurs disponibilités
1. Créer un praticien avec ses horaires de travail (POST `/practitioners`)
2. Consulter la liste des praticiens (GET `/practitioners`)
3. Obtenir les détails d'un praticien spécifique (GET `/practitioners/{id}`)
4. Modifier les horaires d'un praticien (PATCH `/practitioners/{id}`)

### Flux 2: Gestion des rendez-vous
1. Créer un praticien (si pas déjà fait)
2. Consulter les disponibilités d'un praticien (GET `/practitioners/{id}/availability?date=2025-05-15`)
3. Créer un rendez-vous (POST `/appointments`)
4. Consulter les rendez-vous d'un praticien (GET `/appointments?practitionerId={id}`)
5. Annuler un rendez-vous (PATCH `/appointments/{id}/cancel`)

### Flux 3: Gestion de l'agenda
1. Consulter l'agenda d'un praticien (GET `/practitioners/{id}/calendar?start=2025-05-01&end=2025-05-31`)
2. Consulter les rendez-vous d'une journée (GET `/appointments/daily?date=2025-05-15`)

### Flux 4: Gestion de la file d'attente
1. Ajouter un patient à la file d'attente (POST `/waitingList`)
2. Consulter la file d'attente (GET `/waitingList`)
3. Appeler le prochain patient (PATCH `/waitingList/next`)
4. Supprimer un patient de la file d'attente (DELETE `/waitingList/{id}`)

## Structure de la collection

La collection est organisée en quatre dossiers principaux :

### 1. Practitioners
Contient les requêtes pour gérer les praticiens et leurs horaires de travail.

### 2. Appointments
Contient les requêtes pour gérer les rendez-vous (création, modification, annulation, etc.).

### 3. Calendar
Contient les requêtes pour consulter les agendas des praticiens.

### 4. WaitingList
Contient les requêtes pour gérer la file d'attente.

## Exemples de données

### Exemple de praticien
```json
{
  "firstName": "Pierre",
  "lastName": "Martin",
  "speciality": "GENERAL_MEDICINE",
  "email": "pierre.martin@clinique.fr",
  "phoneNumber": "0612345678",
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "slots": [
        { "start": "09:00", "end": "12:00" },
        { "start": "14:00", "end": "18:00" }
      ]
    }
  ],
  "slotDuration": 20,
  "color": "#4285F4"
}
```

### Exemple de rendez-vous
```json
{
  "practitionerId": "550e8400-e29b-41d4-a716-446655440100",
  "patientId": "550e8400-e29b-41d4-a716-446655440010",
  "startDateTime": "2025-05-15T10:00:00Z",
  "endDateTime": "2025-05-15T10:20:00Z",
  "appointmentType": "CONSULTATION",
  "reason": "Consultation générale",
  "notes": "Patient présentant des symptômes grippaux",
  "status": "SCHEDULED"
}
```

## Types d'entités

### Types de spécialités médicales
- `GENERAL_MEDICINE` - Médecine générale
- `CARDIOLOGY` - Cardiologie
- `DERMATOLOGY` - Dermatologie
- `PEDIATRICS` - Pédiatrie
- `OPHTHALMOLOGY` - Ophtalmologie
- `DENTISTRY` - Dentisterie
- `ORTHOPEDICS` - Orthopédie
- `NEUROLOGY` - Neurologie
- `GYNECOLOGY` - Gynécologie
- `PSYCHOLOGY` - Psychologie

### Types de rendez-vous
- `CONSULTATION` - Consultation standard
- `FOLLOW_UP` - Suivi
- `EMERGENCY` - Urgence
- `PROCEDURE` - Procédure médicale
- `EXAMINATION` - Examen

### Statuts de rendez-vous
- `SCHEDULED` - Planifié
- `CONFIRMED` - Confirmé
- `IN_PROGRESS` - En cours
- `COMPLETED` - Terminé
- `CANCELLED` - Annulé
- `NO_SHOW` - Absence

## Automatisation

La collection inclut des scripts de test qui :
1. Stockent automatiquement les IDs des praticiens et rendez-vous créés dans les variables d'environnement
2. Vérifient les codes de statut des réponses
3. Valident la structure des données des réponses

## Notes importantes

- Les rendez-vous ne peuvent être créés que pendant les heures de travail d'un praticien
- Les rendez-vous ne peuvent pas se chevaucher pour un même praticien
- Un patient ne peut avoir qu'un seul rendez-vous à la fois (pas de chevauchement)
- Les rendez-vous annulés ne peuvent pas être modifiés
- La suppression d'un praticien nécessite l'annulation préalable de tous ses rendez-vous 