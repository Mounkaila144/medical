# Système de File d'Attente avec Tickets

Un système moderne de gestion de file d'attente similaire aux systèmes bancaires, avec numérotation automatique de tickets et affichage en temps réel.

## 🎯 Fonctionnalités

### 1. **Prise de Numéro Simple**
- Interface épurée pour que les patients prennent un numéro
- Recherche rapide par nom ou numéro de dossier
- Génération automatique de tickets (format: A001, A002, ..., Z999)
- Affichage immédiat du numéro obtenu

### 2. **Écran d'Affichage Public**
- Affichage en grand du numéro actuellement appelé
- Liste des prochains numéros en attente
- Statistiques en temps réel (nombre en attente, temps d'attente)
- Mise à jour automatique via WebSocket
- Design moderne et professionnel

### 3. **Interface de Gestion Praticien**
- Appel du prochain patient d'un simple clic
- Vue en temps réel de la file d'attente
- Gestion des patients (compléter, annuler)
- Statistiques de la file d'attente
- Indicateur de connexion WebSocket

## 🏗️ Architecture

### Backend (NestJS)

#### Entités
- **WaitQueueEntry**: Entrée de file d'attente avec :
  - `ticketNumber`: Numéro de ticket unique (A001, A002, etc.)
  - `status`: État du patient (WAITING, CALLED, SERVING, COMPLETED, CANCELLED)
  - `calledAt`: Horodatage de l'appel
  - `rank`: Position dans la file
  - `priority`: Priorité (LOW, NORMAL, HIGH, URGENT)

#### Enums
```typescript
export enum QueueStatus {
  WAITING = 'WAITING',      // En attente
  CALLED = 'CALLED',        // Appelé
  SERVING = 'SERVING',      // En cours de consultation
  COMPLETED = 'COMPLETED',  // Terminé
  CANCELLED = 'CANCELLED'   // Annulé
}
```

#### API Endpoints

**Gestion de la file d'attente:**
- `POST /wait-queue` - Ajouter un patient (génère automatiquement un ticket)
- `GET /wait-queue` - Obtenir la file d'attente actuelle
- `POST /wait-queue/call-next` - Appeler le prochain patient
- `GET /wait-queue/currently-serving` - Patient actuellement servi
- `POST /wait-queue/:id/mark-serving` - Marquer comme en cours
- `POST /wait-queue/:id/complete` - Marquer comme terminé
- `PATCH /wait-queue/:id` - Modifier une entrée
- `DELETE /wait-queue/:id` - Annuler une entrée

**WebSocket Events:**
- Namespace: `/queue`
- Events:
  - `queue-updated`: Mise à jour de la file complète
  - `ticket-called`: Notification d'appel de ticket

#### WebSocket Gateway
- Connexion temps réel via Socket.io
- Rooms par tenant pour multi-tenancy
- Émission automatique lors des changements
- Gestion de la reconnexion automatique

### Frontend (Next.js 13 + React)

#### Pages

1. **`/queue/take-number`** - Prise de numéro
   - Recherche de patient
   - Affichage du ticket généré
   - Interface simplifiée et épurée

2. **`/queue/display`** - Écran d'affichage public
   - Numéro appelé en très grand format
   - Liste des prochains numéros
   - Statistiques en temps réel
   - Horloge et date
   - Auto-actualisation via WebSocket

3. **`/queue/manage`** - Gestion praticien
   - Bouton "Appeler le suivant"
   - Liste complète des patients en attente
   - Actions (Terminer, Annuler)
   - Statistiques détaillées

#### Services

**`queue-socket.service.ts`**
```typescript
- connect(tenantId): Connexion au WebSocket
- disconnect(): Déconnexion
- onQueueUpdate(callback): S'abonner aux mises à jour
- onTicketCalled(callback): S'abonner aux appels de tickets
```

**Hook personnalisé `use-queue-socket.ts`**
```typescript
const { queue, currentTicket, isConnected } = useQueueSocket({
  tenantId,
  enabled: true
});
```

## 📦 Installation

### Backend

1. Installer les dépendances WebSocket (si pas déjà fait):
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

2. Exécuter la migration SQL:
```bash
psql -U votre_utilisateur -d votre_base < src/scheduling/migrations/add-ticket-number-to-queue.sql
```

3. Le Gateway WebSocket est automatiquement chargé avec le module Scheduling

### Frontend

1. Installer socket.io-client:
```bash
npm install socket.io-client
```

2. Vérifier que les nouvelles pages sont accessibles:
   - http://localhost:3000/queue/take-number
   - http://localhost:3000/queue/display
   - http://localhost:3000/queue/manage

## 🚀 Utilisation

### Workflow typique

1. **Patient arrive à la clinique**
   - Accède à `/queue/take-number`
   - Recherche son nom
   - Obtient un ticket (ex: A023)

2. **Écran public affiche**
   - Le numéro actuellement appelé en grand
   - Les 10 prochains numéros
   - Le nombre de personnes en attente

3. **Praticien appelle le suivant**
   - Clique sur "Appeler le suivant" dans `/queue/manage`
   - Le numéro s'affiche automatiquement sur l'écran public
   - Le patient se présente au guichet

4. **Fin de consultation**
   - Praticien clique sur "Terminer"
   - Le patient passe en statut COMPLETED
   - Le suivant peut être appelé

### Génération des numéros de tickets

Le système génère automatiquement des numéros au format:
- **Lettre** (A-Z): Réinitialisé chaque jour, incrémenté tous les 999 tickets
- **Numéro** (001-999): Incrémenté pour chaque ticket

Exemples: A001, A002, ..., A999, B001, B002, ...

Les numéros sont uniques par jour et par tenant.

## 🎨 Design

Le système utilise un design moderne et professionnel:

### Couleurs
- **Primaire**: Bleu (#2563EB) - Confiance et professionnalisme
- **Accent**: Dégradés de bleu pour l'affichage public
- **Statut**: Vert (succès), Rouge (erreur), Orange (attente)

### Typographie
- Numéros de tickets: Police très grande (text-8xl, text-9xl)
- Interface claire et lisible même de loin

### Animations
- Pulse sur le numéro appelé
- Transitions douces
- Indicateurs de connexion WebSocket

## 🔧 Configuration

### Variables d'environnement

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (.env):**
```env
# Configuration WebSocket (déjà dans votre config)
CORS_ORIGIN=http://localhost:3000
```

### Tenant ID

Le tenant ID est actuellement hardcodé dans les pages. Pour le récupérer automatiquement:

```typescript
// Utiliser le hook useAuth
const { user } = useAuth();
const tenantId = user?.tenantId || 'default';
```

## 📊 Statistiques et Monitoring

L'interface de gestion affiche:
- Nombre de patients en attente
- Patient actuellement servi
- Temps d'attente moyen
- Historique des appels

## 🔒 Sécurité

- Authentification JWT requise pour toutes les routes API
- Guards TenantGuard pour l'isolation multi-tenant
- WebSocket avec authentification (à implémenter si nécessaire)

## 🐛 Debugging

### WebSocket ne se connecte pas
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans la console: doit pointer vers le bon port
3. Vérifier les logs du backend pour les tentatives de connexion

### Les numéros ne s'affichent pas
1. Vérifier la migration SQL a été exécutée
2. Vérifier que `ticket_number` est bien généré
3. Vérifier les logs du service backend

### Pas de mise à jour en temps réel
1. Vérifier l'indicateur de connexion WebSocket
2. Vérifier que le Gateway émet bien les événements
3. Vérifier le tenantId utilisé

## 📝 TODO / Améliorations futures

- [ ] Ajouter l'authentification WebSocket
- [ ] Ajouter un système de notification sonore
- [ ] Ajouter des statistiques d'utilisation
- [ ] Permettre de rappeler un patient
- [ ] Ajouter une priorité visuelle (urgence en rouge)
- [ ] Historique des tickets par jour
- [ ] Export des statistiques
- [ ] Mode kiosque pour l'écran public (plein écran, pas de navigation)
- [ ] Support multi-langues
- [ ] Impression de tickets physiques

## 📞 Support

Pour toute question ou problème, vérifiez d'abord:
1. Les logs du backend
2. La console du navigateur
3. L'état de la connexion WebSocket
4. La base de données (colonnes ajoutées)

---

**Créé le**: 2025-11-01
**Version**: 1.0.0
**Auteur**: Claude Code
