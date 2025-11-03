# Guide de Migration - Système de File d'Attente avec Tickets

Ce guide vous aidera à déployer le nouveau système de file d'attente avec numérotation automatique de tickets.

## ✅ Pré-requis

- PostgreSQL en cours d'exécution
- Node.js et npm installés
- Backend et frontend démarrés

## 📋 Étapes de Migration

### 1. Installation des Dépendances

#### Backend
```bash
cd C:\Users\Mounkaila\PhpstormProjects\medicalBackend

# Installer les dépendances WebSocket (si pas déjà fait)
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

#### Frontend
```bash
cd C:\Users\Mounkaila\PhpstormProjects\medicalFrontend\medical\medicalFrontend

# Socket.io-client déjà installé
# npm install socket.io-client
```

### 2. Migration de la Base de Données

#### Option A: Via psql (Recommandé)
```bash
# Connexion à la base de données
psql -U postgres -d medical_db

# Exécution de la migration
\i C:/Users/Mounkaila/PhpstormProjects/medicalBackend/src/scheduling/migrations/add-ticket-number-to-queue.sql

# Vérification
\d wait_queue_entries
```

#### Option B: Via pgAdmin
1. Ouvrir pgAdmin
2. Connexion à votre serveur PostgreSQL
3. Sélectionner la base de données `medical_db`
4. Tools → Query Tool
5. Ouvrir le fichier SQL: `src/scheduling/migrations/add-ticket-number-to-queue.sql`
6. Exécuter (F5)
7. Vérifier les messages de confirmation

### 3. Vérification de la Migration

Exécutez ces requêtes pour vérifier:

```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'wait_queue_entries'
AND column_name IN ('ticket_number', 'status', 'called_at');

-- Vérifier que l'enum existe
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'queue_status';

-- Vérifier les index
SELECT indexname
FROM pg_indexes
WHERE tablename = 'wait_queue_entries';
```

Résultat attendu:
- 3 colonnes trouvées: ticket_number, status, called_at
- 5 valeurs d'enum: WAITING, CALLED, SERVING, COMPLETED, CANCELLED
- Au moins 3 index créés

### 4. Redémarrage du Backend

```bash
cd C:\Users\Mounkaila\PhpstormProjects\medicalBackend

# Arrêter le serveur (Ctrl+C si en cours)

# Redémarrer
npm run start:dev
```

Vérifiez les logs pour:
- ✅ Pas d'erreur de synchronisation TypeORM
- ✅ WebSocket Gateway démarré
- ✅ Module Scheduling chargé correctement

### 5. Démarrage du Frontend

```bash
cd C:\Users\Mounkaila\PhpstormProjects\medicalFrontend\medical\medicalFrontend

# Redémarrer si déjà en cours
npm run dev
```

### 6. Tests de Fonctionnement

#### Test 1: Prise de Numéro
1. Accéder à: http://localhost:3000/queue/take-number
2. Rechercher un patient
3. Prendre un numéro
4. Vérifier l'affichage du ticket (ex: A001)

#### Test 2: Affichage Public
1. Accéder à: http://localhost:3000/queue/display
2. Vérifier l'affichage de la file d'attente
3. Vérifier l'indicateur de connexion WebSocket (doit être vert "En ligne")

#### Test 3: Gestion Praticien
1. Accéder à: http://localhost:3000/queue/manage
2. Vérifier la liste des patients en attente
3. Cliquer sur "Appeler le suivant"
4. Vérifier que le numéro s'affiche automatiquement sur l'écran public

#### Test 4: WebSocket en Temps Réel
1. Ouvrir 2 onglets:
   - Onglet 1: http://localhost:3000/queue/display
   - Onglet 2: http://localhost:3000/queue/manage
2. Dans l'onglet 2, appeler le suivant
3. Vérifier que l'onglet 1 se met à jour automatiquement (sans refresh)

### 7. Vérification de la Base de Données

```sql
-- Voir les entrées avec tickets
SELECT
    id,
    ticket_number,
    status,
    rank,
    created_at,
    called_at
FROM wait_queue_entries
ORDER BY created_at DESC
LIMIT 10;

-- Compter par statut
SELECT
    status,
    COUNT(*) as count
FROM wait_queue_entries
GROUP BY status;
```

## 🔧 Configuration Tenant ID

Le tenant ID est actuellement hardcodé. Pour utiliser le vrai tenant ID:

### Dans les pages frontend

**Modifier les pages:**
- `app/queue/take-number/page.tsx`
- `app/queue/display/page.tsx`
- `app/queue/manage/page.tsx`

**Remplacer:**
```typescript
const tenantId = 'your-tenant-id'; // TODO: Get from auth context
```

**Par:**
```typescript
import { useAuth } from '@/hooks/use-auth';

// Dans le composant
const { user } = useAuth();
const tenantId = user?.tenantId || '';
```

## 🐛 Résolution des Problèmes

### Erreur: "Column does not exist"
- La migration n'a pas été exécutée
- Solution: Re-exécuter le script SQL

### Erreur: "Type queue_status does not exist"
- L'enum n'a pas été créé
- Solution: Re-exécuter la migration complète

### WebSocket ne se connecte pas
- Vérifier que le backend est démarré
- Vérifier les CORS dans le backend
- Vérifier l'URL dans `NEXT_PUBLIC_API_URL`

### Les tickets ne sont pas générés
- Vérifier les logs du backend
- Vérifier la fonction `generateTicketNumber` dans le service
- Vérifier que `ticketNumber` n'est pas null dans la DB

### Pas de mise à jour en temps réel
- Vérifier l'indicateur WebSocket (doit être vert)
- Vérifier les logs du backend pour les événements émis
- Vérifier le tenant ID utilisé

## 📊 Monitoring

### Logs à surveiller

**Backend:**
```
Queue socket connected, socket ID: xxxxx
Successfully joined queue updates for tenant: xxxxx
Emitting queue update to room: tenant-xxxxx
```

**Frontend (Console):**
```
Connecting to queue socket: http://localhost:3001
Queue socket connected, socket ID: xxxxx
Successfully joined queue updates for tenant: xxxxx
Queue update received in hook: X
```

## 🎯 Prochaines Étapes

Après une migration réussie:

1. **Tester en environnement de production**
   - Utiliser les vraies données
   - Tester avec plusieurs utilisateurs simultanés

2. **Former le personnel**
   - Montrer comment prendre un numéro
   - Expliquer l'interface de gestion
   - Configurer l'écran d'affichage public

3. **Optimisations**
   - Configurer un écran dédié pour l'affichage public
   - Ajouter une notification sonore
   - Personnaliser les numéros si nécessaire

4. **Backup**
   - Sauvegarder la configuration
   - Exporter les statistiques régulièrement

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs (backend et frontend)
2. Vérifier la base de données
3. Vérifier la connexion WebSocket
4. Consulter le README-QUEUE-SYSTEM.md

---

**Date de création**: 2025-11-01
**Version**: 1.0.0