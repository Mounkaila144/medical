# Authentification des Praticiens

Ce document décrit le système d'authentification pour les praticiens, leur permettant d'avoir leurs propres comptes et d'accéder à leur emploi du temps personnel.

## Vue d'ensemble

Le système permet aux praticiens de :
- Se connecter avec leurs propres identifiants
- Voir uniquement leurs rendez-vous et leur emploi du temps
- Accéder à leurs statistiques personnelles
- Gérer leur disponibilité

## Architecture

### Entités

1. **User** - Entité d'authentification avec le rôle `PRACTITIONER`
2. **Practitioner** - Entité métier liée à un utilisateur via `userId`

### Relation

```
User (role: PRACTITIONER) ←→ Practitioner (userId)
```

## Endpoints d'authentification

### Connexion des praticiens
```
POST /auth/practitioner/login
Content-Type: application/json

{
  "email": "dr.martin@clinic.com",
  "password": "practitioner123"
}
```

**Réponse :**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "practitioner": {
    "id": "uuid",
    "firstName": "Dr. Martin",
    "lastName": "Dupont",
    "specialty": "Cardiologie",
    "color": "#3498db"
  }
}
```

### Profil du praticien
```
GET /auth/practitioner/profile
Authorization: Bearer <accessToken>
```

### Rafraîchissement du token
```
POST /auth/practitioner/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Déconnexion
```
POST /auth/practitioner/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Endpoints de l'emploi du temps

### Rendez-vous du jour
```
GET /practitioner/schedule/appointments
Authorization: Bearer <accessToken>

# Avec une date spécifique
GET /practitioner/schedule/appointments?date=2024-01-15
```

### Rendez-vous de la semaine
```
GET /practitioner/schedule/appointments/week
Authorization: Bearer <accessToken>

# Avec une date de début spécifique
GET /practitioner/schedule/appointments/week?startDate=2024-01-15
```

### Rendez-vous du mois
```
GET /practitioner/schedule/appointments/month
Authorization: Bearer <accessToken>

# Avec un mois/année spécifique
GET /practitioner/schedule/appointments/month?year=2024&month=1
```

### Détails d'un rendez-vous
```
GET /practitioner/schedule/appointments/:id
Authorization: Bearer <accessToken>
```

### Disponibilités
```
GET /practitioner/schedule/availability
Authorization: Bearer <accessToken>

# Avec une date spécifique
GET /practitioner/schedule/availability?date=2024-01-15
```

### Statistiques personnelles
```
GET /practitioner/schedule/stats
Authorization: Bearer <accessToken>

# Avec une période spécifique
GET /practitioner/schedule/stats?startDate=2024-01-01&endDate=2024-01-31
```

## Configuration initiale

### 1. Migration de la base de données

Exécutez la migration pour ajouter la colonne `user_id` à la table `practitioners` :

```bash
npm run migration:run
```

### 2. Création des comptes praticiens

Utilisez le script de seed pour créer automatiquement des comptes utilisateurs pour les praticiens existants :

```bash
npm run ts-node src/seed-practitioners.ts
```

Ce script :
- Crée un utilisateur avec le rôle `PRACTITIONER` pour chaque praticien
- Génère un email basé sur le nom : `prenom.nom@clinic.com`
- Définit un mot de passe par défaut : `practitioner123`
- Lie l'utilisateur au praticien

### 3. Création manuelle d'un praticien

Pour créer manuellement un compte praticien :

1. **Créer l'utilisateur :**
```sql
INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
VALUES (
  gen_random_uuid(),
  'dr.martin@clinic.com',
  '$2b$10$hashedPassword',
  'PRACTITIONER',
  'Dr. Martin',
  'Dupont',
  'tenant-id'
);
```

2. **Créer le praticien :**
```sql
INSERT INTO practitioners (id, tenant_id, first_name, last_name, specialty, color, user_id)
VALUES (
  gen_random_uuid(),
  'tenant-id',
  'Dr. Martin',
  'Dupont',
  'Cardiologie',
  '#3498db',
  'user-id-from-step-1'
);
```

## Sécurité

### Contrôles d'accès

1. **Authentification requise** : Tous les endpoints praticiens nécessitent un token JWT valide
2. **Isolation des données** : Chaque praticien ne peut voir que ses propres données
3. **Validation du rôle** : Seuls les utilisateurs avec le rôle `PRACTITIONER` peuvent accéder aux endpoints praticiens

### Validation des permissions

Le système vérifie automatiquement :
- Que l'utilisateur connecté a le rôle `PRACTITIONER`
- Que le praticien associé existe
- Que les rendez-vous demandés appartiennent bien au praticien connecté

## Exemples d'utilisation

### Connexion et récupération des rendez-vous

```javascript
// 1. Connexion
const loginResponse = await fetch('/auth/practitioner/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dr.martin@clinic.com',
    password: 'practitioner123'
  })
});

const { accessToken, practitioner } = await loginResponse.json();

// 2. Récupération des rendez-vous du jour
const appointmentsResponse = await fetch('/practitioner/schedule/appointments', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const appointments = await appointmentsResponse.json();
```

### Interface frontend

Exemple de structure pour une interface praticien :

```javascript
// Dashboard praticien
const PractitionerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    // Charger les rendez-vous du jour
    fetchTodayAppointments();
    // Charger les statistiques du mois
    fetchMonthlyStats();
  }, []);
  
  return (
    <div>
      <h1>Bonjour Dr. {practitioner.firstName}</h1>
      <AppointmentsList appointments={appointments} />
      <StatsWidget stats={stats} />
    </div>
  );
};
```

## Dépannage

### Problèmes courants

1. **"Praticien non trouvé"** : Vérifiez que l'utilisateur est bien lié à un praticien
2. **"Accès refusé"** : Vérifiez que l'utilisateur a le rôle `PRACTITIONER`
3. **Token expiré** : Utilisez l'endpoint de refresh pour renouveler le token

### Logs utiles

```bash
# Vérifier les connexions praticiens
grep "practitioner login" logs/app.log

# Vérifier les erreurs d'authentification
grep "authentication failed" logs/app.log
``` 