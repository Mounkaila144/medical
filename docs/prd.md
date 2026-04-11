# Clinoo+ Brownfield Enhancement PRD

## 1. Intro — Project Analysis and Context

### Analysis Source

- Brief du projet : `docs/brief.md` (valide par le stakeholder)
- Analyse technique du codebase : exploration complete des 3 composants (frontend, backend, mobile)

### Current Project State

Clinoo+ est une plateforme de gestion de cliniques medicales multi-tenant fonctionnelle dans ses grandes lignes, composee de :
- **Frontend web** : Next.js 16 / TypeScript / shadcn/ui — 25+ pages, 12 services, 50+ composants
- **Backend API** : NestJS / TypeORM / MySQL — 8 modules, 40 entites, JWT auth, GraphQL + REST
- **Mobile** : Flutter / Riverpod / Drift — 270 fichiers, 22 tables SQLite, offline-first avec sync

Le systeme gere : patients, rendez-vous, consultations (SOAP), prescriptions, resultats labo, facturation, depenses, tarifs, file d'attente temps reel, et administration multi-tenant.

### Available Documentation

- [x] Tech Stack Documentation (via CLAUDE.md backend + frontend)
- [x] Source Tree / Architecture (analyse du codebase)
- [ ] Coding Standards (aucun document formel)
- [ ] API Documentation (pas de Swagger)
- [ ] External API Documentation
- [ ] UX/UI Guidelines
- [x] Technical Debt Documentation (identifie dans le brief)

### Enhancement Type

- [x] Major Feature Modification (systeme de roles et interfaces)
- [x] UI/UX Overhaul (dashboards et sidebar par role)
- [x] Bug Fix and Stability Improvements (isolation tenant, coherence, securite)
- [x] New Feature Addition (role ACCOUNTANT, profil utilisateur, detection doublons)

### Enhancement Description

Refonte structurelle du systeme de roles et des interfaces utilisateur pour creer des espaces dedies par type d'utilisateur (SuperAdmin, ClinicAdmin, Practitioner, Employee, Accountant), corriger les incoherences techniques et les failles de securite, et ajouter les fonctionnalites manquantes pour un deploiement production multi-cliniques fiable.

### Impact Assessment

- [x] **Significant Impact** (substantial existing code changes) — Modifications dans : enum de roles (backend + frontend + mobile), sidebar, middleware, 5 dashboards, tous les controllers billing, guards, services dupliques, types TypeScript

### Goals

- Deployer en production multi-tenant avec isolation tenant certifiee
- Chaque role a une interface dediee montrant uniquement les fonctionnalites pertinentes
- Le SUPERADMIN ne voit aucune donnee clinique
- Les praticiens ont un espace autonome avec donnees reelles
- Le comptable a un espace dedie pour la gestion financiere
- Zero incoherence de nommage de roles entre les 3 composants
- Corrections de securite critiques (CORS, JWT secrets, rate limiting)

### Background Context

Clinoo+ a ete developpe entierement a la main par un developpeur seul. L'architecture modulaire NestJS est solide, mais l'absence de revue systematique a conduit a une accumulation d'incoherences : roles nommes differemment entre frontend et backend, services dupliques, types `any` en masse, et surtout une absence de separation des interfaces par role. Le systeme fonctionne pour un usage mono-clinique avec un seul type d'utilisateur, mais ne peut pas etre deploye de maniere fiable pour plusieurs cliniques independantes avec des roles varies (medecins, comptables, employes). Cette refonte est necessaire avant toute commercialisation ou deploiement a echelle.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Creation initiale du PRD | 2026-04-11 | 1.0 | PRD brownfield base sur le brief et l'analyse du codebase | John (PM) |

---

## 2. Requirements

### Functional Requirements

**Axe 1 — Systeme de Roles et Authentification**

- **FR1 :** Le backend definira 5 roles dans l'enum `AuthUserRole` : `SUPERADMIN`, `CLINIC_ADMIN`, `EMPLOYEE`, `PRACTITIONER`, `ACCOUNTANT`. Tous les `@Roles()` decorators seront mis a jour en consequence.
- **FR2 :** Le frontend alignera l'enum `UserRole` dans `types/index.ts` sur les valeurs exactes du backend (suppression de `SUPER_ADMIN`, `STAFF`, `ADMIN`).
- **FR3 :** L'app mobile Flutter alignera ses modeles d'authentification sur les memes valeurs de roles que le backend.
- **FR4 :** Apres connexion, l'utilisateur sera redirige automatiquement vers le dashboard correspondant a son role :
  - `SUPERADMIN` → `/admin/dashboard`
  - `CLINIC_ADMIN` → `/dashboard`
  - `PRACTITIONER` → `/practitioner/dashboard`
  - `EMPLOYEE` → `/dashboard`
  - `ACCOUNTANT` → `/accounting/dashboard`
- **FR5 :** Chaque utilisateur pourra acceder a une page Profil pour modifier ses informations personnelles (prenom, nom, email) et changer son mot de passe.

**Axe 2 — Interfaces dediees par role**

- **FR6 :** La sidebar sera dynamique et n'affichera que les menus autorises pour le role de l'utilisateur connecte :
  - `SUPERADMIN` : Tenants & Cliniques, Utilisateurs, Permissions, Administration
  - `CLINIC_ADMIN` : Tableau de bord, Patients, Praticiens, Consultations, Planification, Comptabilite, Utilisateurs de la clinique
  - `PRACTITIONER` : Tableau de bord, Mes Patients, Mon Planning, Consultations, Prescriptions, Resultats labo
  - `EMPLOYEE` : Tableau de bord, Patients, Planification, File d'attente, Facturation
  - `ACCOUNTANT` : Tableau de bord, Factures, Paiements, Depenses, Tarifs & Prix
- **FR7 :** Le dashboard SUPERADMIN affichera : nombre total de tenants (actifs/inactifs), nombre total d'utilisateurs, cliniques actives, et actions rapides (creer un tenant, gerer les utilisateurs). Aucune donnee clinique (patients, RDV, revenus de clinique).
- **FR8 :** Le dashboard PRACTITIONER affichera des donnees reelles via API : ses RDV du jour, nombre de ses patients actifs, ses consultations recentes, son activite. Remplacement de toutes les donnees hardcodees actuelles.
- **FR9 :** Le dashboard ACCOUNTANT affichera : revenus du mois, depenses du mois, factures en attente, repartition des depenses par categorie. Aucun acces aux donnees cliniques.
- **FR10 :** Le dashboard EMPLOYEE affichera : patients du jour, RDV a venir, file d'attente active, actions rapides (nouveau patient, nouveau RDV).
- **FR11 :** Le SUPERADMIN ne pourra pas acceder aux routes cliniques (`/patients`, `/encounters`, `/appointments`, `/billing`, `/accounting`). Le middleware redirigera vers `/admin/dashboard`.
- **FR12 :** Le ACCOUNTANT ne pourra pas acceder aux routes cliniques (`/patients`, `/encounters`, `/practitioners`). Le middleware redirigera vers `/accounting/dashboard`.

**Axe 3 — Securite et Isolation Tenant**

- **FR13 :** Tous les endpoints de donnees (patients, encounters, appointments, invoices, payments, expenses, tariffs, prescriptions, lab-results) filtreront par `tenantId` dans leurs methodes `findOne()` et `findAll()`.
- **FR14 :** La configuration CORS sera restreinte aux domaines autorises via une variable d'environnement `CORS_ORIGINS` (au lieu de `origin: '*'`).
- **FR15 :** Un rate limiting sera applique sur les endpoints d'authentification (`/auth/login`, `/auth/refresh`, `/auth/practitioner/login`) : maximum 10 tentatives par minute par IP.
- **FR16 :** Les secrets JWT (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) seront exclus du fichier `.env` commite dans le repo et documentes comme variables d'environnement serveur.
- **FR17 :** Le `TenantGuard` sera corrige pour utiliser `user.role === AuthUserRole.SUPERADMIN` au lieu de `user.isAdmin` (propriete inexistante).

**Axe 4 — Nettoyage et Coherence du Code**

- **FR18 :** Les services dupliques du frontend seront supprimes. Seront conserves uniquement : `auth.service.ts`, `appointment.service.ts`, `patient.service.ts`. Les anciens fichiers (`auth-service.ts`, `appointment-service.ts`, `api-service.ts`) seront supprimes. Toutes les pages seront migrees vers les services conserves.
- **FR19 :** L'import manquant `RegisterData` dans `services/auth-service.ts` sera resolu par la suppression de ce fichier (FR18).
- **FR20 :** Le service `patient.service.ts` sera migre du pattern `fetch + getAuthHeaders()` vers le pattern `apiClient` pour beneficier du refresh token automatique.

**Axe 5 — Nouvelles Fonctionnalites**

- **FR21 :** Lors de la creation d'un patient, le systeme detectera les doublons potentiels (meme nom + meme date de naissance) et affichera un avertissement avec la liste des correspondances avant confirmation.
- **FR22 :** Lors de la creation ou modification d'un RDV, le systeme verifiera les conflits de creneau pour le praticien selectionne et bloquera la creation en cas de chevauchement.
- **FR23 :** Les prescriptions et factures disposeront d'une vue d'impression optimisee (CSS `@media print`) avec en-tete de la clinique, mise en page propre, et QR code.
- **FR24 :** Un centre de notifications in-app sera ajoute dans le header, affichant les evenements recents : nouveaux RDV, factures en attente, patients en file d'attente (base sur les events EventEmitter existants).
- **FR25 :** Un Error Boundary React global sera ajoute au layout pour capturer les erreurs non gerees et afficher une page d'erreur conviviale en francais au lieu d'un ecran blanc.

### Non-Functional Requirements

- **NFR1 :** Aucune regression sur les fonctionnalites existantes. Chaque modification doit etre verifiee contre le fonctionnement actuel avant merge.
- **NFR2 :** Le temps de chargement des dashboards ne depassera pas 3 secondes sur une connexion 3G standard.
- **NFR3 :** Toute l'interface utilisateur restera en francais. Aucun texte anglais ne sera visible par l'utilisateur final.
- **NFR4 :** Le mode offline-first de l'app mobile (SyncEngine, PendingOperations) ne sera pas impacte par les changements de roles.
- **NFR5 :** Les `console.log()` de debug ne seront pas ajoutes dans le nouveau code. Les logs existants seront progressivement remplaces par un pattern conditionnel (`if (process.env.NODE_ENV === 'development')`).
- **NFR6 :** Le nouveau code frontend n'utilisera pas le type `any`. Tous les nouveaux composants et services utiliseront des types stricts.

### Compatibility Requirements

- **CR1 — Compatibilite API :** Les endpoints REST existants conserveront leurs contrats (URL, methode HTTP, format de reponse). L'ajout du role ACCOUNTANT est additif et ne casse aucun endpoint existant. L'app mobile qui consomme ces endpoints ne doit pas etre impactee.
- **CR2 — Compatibilite Schema DB :** L'ajout de `ACCOUNTANT` dans l'enum `AuthUserRole` est une modification additive compatible. Aucune migration destructive (DROP, RENAME de colonne). `synchronize: true` en dev gere l'ajout.
- **CR3 — Coherence UI/UX :** Les nouveaux dashboards et composants utiliseront exclusivement les composants shadcn/ui existants, les couleurs brand definies dans Tailwind (`brand-blue`, `brand-cyan`, `brand-green`, `brand-teal`), et les patterns de mise en page existants (Card, Badge, Button, etc.).
- **CR4 — Compatibilite Mobile :** Les changements de noms de roles dans le backend doivent etre refletes dans les modeles Flutter (`AuthNotifier`, `auth_service.dart`). Le `SyncDispatcher` et les endpoints de sync ne doivent pas etre impactes.

---

## 3. User Interface Enhancement Goals

### Integration with Existing UI

Tous les nouveaux ecrans s'integreront dans le systeme de design existant :
- **Layout :** `MainLayout` existant (sidebar + header + breadcrumbs) pour tous les roles sauf SUPERADMIN qui aura une variante avec sidebar reduite
- **Composants :** Exclusivement shadcn/ui (Card, Badge, Button, Table, Dialog, Form, Select, etc.)
- **Theme :** Couleurs brand existantes (`brand-blue`, `brand-cyan`, `brand-green`, `brand-teal`)
- **Icons :** Lucide React (deja utilise partout)
- **Dark mode :** Compatible via `next-themes` (deja configure)
- **Responsive :** Mobile-first, grilles `grid-cols-2 lg:grid-cols-4` comme les dashboards existants

### Modified / New Screens

| Ecran | Action | Role(s) concerne(s) | Description |
|-------|--------|---------------------|-------------|
| **Sidebar** (`components/layout/sidebar.tsx`) | Modifier | Tous | Filtrage dynamique des menus par role |
| **Dashboard principal** (`app/dashboard/page.tsx`) | Modifier | CLINIC_ADMIN, EMPLOYEE | Routage conditionnel par role |
| **Dashboard SUPERADMIN** (`app/admin/dashboard/page.tsx`) | Nouveau | SUPERADMIN | Stats tenants, users, cliniques. Actions rapides. |
| **Dashboard Praticien** (`app/practitioner/dashboard/page.tsx`) | Modifier | PRACTITIONER | Remplacer donnees hardcodees par appels API reels |
| **Dashboard Comptable** (`app/accounting/dashboard/page.tsx`) | Modifier | ACCOUNTANT | Dashboard financier dedie |
| **Dashboard Employee** | Modifier | EMPLOYEE | Vue simplifiee : patients du jour, RDV, file d'attente |
| **Page Profil** (`app/profile/page.tsx`) | Nouveau | Tous | Modifier ses infos, changer son mot de passe |
| **Middleware** (`middleware.ts`) | Modifier | Tous | Protection des routes par role |
| **Page Users admin** (`app/admin/users/page.tsx`) | Modifier | SUPERADMIN | Ajouter role ACCOUNTANT dans les formulaires et filtres |
| **Login** (`app/auth/login/page.tsx`) | Modifier | Tous | Redirection post-login selon le role |
| **Centre de notifications** (header) | Nouveau | Tous | Dropdown de notifications in-app dans le header |
| **Vue impression prescriptions** | Nouveau | PRACTITIONER | CSS print avec en-tete clinique |
| **Vue impression factures** | Nouveau | ACCOUNTANT, EMPLOYEE | CSS print avec details facturation |
| **Error Boundary** | Nouveau | Tous | Composant global d'erreur en francais |

### UI Consistency Requirements

- **Pattern de dashboard :** Tous les dashboards suivront la meme structure visuelle :
  1. Header avec gradient (`bg-gradient-to-r from-brand-blue to-brand-cyan`) et message de bienvenue
  2. Grille de 4 stat cards avec icones et tendances
  3. Section alertes/notifications (si applicable)
  4. Grille 2-3 colonnes de widgets detailles
  5. Section actions rapides en bas
- **Pattern de formulaire :** React Hook Form + Zod + shadcn Form components
- **Pattern de liste :** Table shadcn avec filtres, recherche, pagination, et actions dropdown
- **Toasts :** Sonner pour toutes les notifications de succes/erreur
- **Animations :** `hover:shadow-lg transition-all duration-300 hover:scale-105` sur les cards
- **Textes :** Francais uniquement

---

## 4. Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages :** TypeScript 5.2 (frontend + backend), Dart 3.x (mobile)
**Frameworks :** Next.js 16 (frontend), NestJS (backend), Flutter 3.x (mobile)
**Database :** MySQL (production), SQLite (mobile offline), PostgreSQL (supporte mais non utilise)
**ORM :** TypeORM (backend), Drift (mobile)
**Infrastructure :** PM2 (process manager), RabbitMQ (messaging), MinIO (object storage), Socket.io (real-time)
**External Dependencies :** bcrypt (hashing), passport-jwt (auth), jsPDF (PDF generation), pdfkit + qrcode (backend PDF), Recharts (charts)

### Integration Approach

**Database Integration Strategy :**
- Ajout de `ACCOUNTANT` a l'enum `AuthUserRole` — TypeORM avec `synchronize: true` en dev gere l'extension de l'enum MySQL automatiquement
- Aucune nouvelle table requise pour le MVP
- Aucune migration destructive

**API Integration Strategy :**
- Les endpoints existants conservent leurs signatures
- Ajout de `AuthUserRole.ACCOUNTANT` aux `@Roles()` decorators des controllers billing
- Nouveau endpoint : `PATCH /auth/profile` pour la mise a jour du profil
- Nouveau endpoint : `POST /auth/change-password` pour le changement de mot de passe
- Nouveau endpoint : `GET /patients/check-duplicate` pour la detection de doublons

**Frontend Integration Strategy :**
- Refactoring de la sidebar : une seule source de verite (`navigation` array) filtree par role
- Nouveau composant `RoleBasedRedirect` dans le dashboard principal
- Nouveau composant `NotificationCenter` dans le header
- Nouveau composant `ErrorBoundary` dans le layout
- Migration progressive des services : suppression des anciens apres verification

**Testing Integration Strategy :**
- Tests manuels sur chaque role (login → dashboard → navigation → acces aux routes)
- Verification de l'isolation tenant : tenter d'acceder aux donnees d'un autre tenant
- Verification des redirections : chaque role est redirige vers le bon dashboard
- Tests de non-regression : les pages existantes fonctionnent toujours

### Code Organization and Standards

**File Structure :**
```
app/
├── admin/dashboard/page.tsx        (nouveau - SUPERADMIN)
├── practitioner/dashboard/page.tsx  (modifie - donnees API)
├── accounting/dashboard/page.tsx    (modifie - ACCOUNTANT)
├── profile/page.tsx                 (nouveau - tous roles)
├── dashboard/page.tsx               (modifie - routage par role)
components/
├── layout/sidebar.tsx               (modifie - filtrage par role)
├── layout/error-boundary.tsx        (nouveau)
├── notifications/notification-center.tsx (nouveau)
hooks/
├── useAuth.ts                       (modifie - getUserRole helper)
types/
├── index.ts                         (modifie - UserRole enum)
```

**Naming Conventions :** kebab-case pour les fichiers, PascalCase pour les composants, camelCase pour les fonctions/variables.

**Coding Standards :** Pas de `any`, pas de `console.log` dans le nouveau code, composants `'use client'` avec pattern `mounted` pour l'hydratation.

### Deployment and Operations

**Build Process :** Le build Next.js (`npm run build`) et le build NestJS (`npm run build`) ne changent pas.

**Deployment Strategy :** Deploiement standard via PM2. Changements retro-compatibles — pas de downtime necessaire.

**Configuration Management :** Variables d'environnement sensibles documentees dans `.env.example`. Fichier `.env` avec secrets ajoute au `.gitignore`.

### Risk Assessment and Mitigation

**Technical Risks :**
- Changement des noms de roles pourrait casser les tokens JWT existants → **Mitigation :** Les tokens encodent le `userId`, pas le `role`. Le role est lu depuis la DB a chaque requete via `JwtAccessStrategy`. Le changement d'enum est safe.
- Suppression des services dupliques pourrait casser des pages → **Mitigation :** Recherche exhaustive de tous les imports avant suppression. Remplacement un par un.

**Integration Risks :**
- L'app mobile Flutter utilise des valeurs de roles hardcodees → **Mitigation :** Mettre a jour les modeles Flutter en meme temps que le backend.
- Le middleware de route protection est base sur les cookies (mais tokens en localStorage) → **Mitigation :** La protection se fait aussi cote composant (useAuth) et backend (guards).

**Deployment Risks :**
- Changement d'enum MySQL pourrait echouer sur DB existante → **Mitigation :** Verifier `synchronize: true` ou ecrire une migration `ALTER TABLE users MODIFY COLUMN role ENUM(...)`.

**Mitigation Strategies :**
- Implementer en increments (stories) testables individuellement
- Commencer par le backend (role enum + guards), puis le frontend (types + sidebar + dashboards)
- Garder les anciens services comme fallback pendant la migration, supprimer en dernier

---

## 5. Epic and Story Structure

### Epic Approach

**Epic Structure Decision :** 3 epics distincts.

Les axes (backend/securite, interfaces, fonctionnalites) sont naturellement decouples. Le sequencage est logique : le backend doit etre consolide avant de modifier les interfaces. Chaque epic livre de la valeur independamment — meme si on s'arrete apres l'Epic 1, le systeme est plus sur.

| Epic | Titre | Scope | Prerequis |
|------|-------|-------|-----------|
| **Epic 1** | Fondations : Roles, Securite et Nettoyage | Backend roles, isolation tenant, securite, nettoyage services | Aucun |
| **Epic 2** | Interfaces dediees par role | Sidebar dynamique, 5 dashboards, middleware par role, profil utilisateur | Epic 1 |
| **Epic 3** | Fonctionnalites complementaires | Detection doublons, conflits RDV, impressions, notifications, error boundary | Epic 1 |

---

## 6. Epic 1 : Fondations — Roles, Securite et Nettoyage

**Epic Goal :** Consolider les fondations techniques du systeme pour garantir la securite, l'isolation tenant et la coherence des roles avant de modifier les interfaces.

**Integration Requirements :** Modifications backend + types frontend + modeles mobile. Aucun changement d'UI visible pour l'utilisateur final (sauf correction de permissions).

### Story 1.1 — Harmoniser le systeme de roles

> En tant que developpeur,
> je veux que les roles soient identiques entre backend, frontend et mobile,
> afin d'eliminer les echecs silencieux de verification de permissions.

**Acceptance Criteria :**
1. L'enum `AuthUserRole` backend contient : `SUPERADMIN`, `CLINIC_ADMIN`, `EMPLOYEE`, `PRACTITIONER`, `ACCOUNTANT`
2. L'enum `UserRole` frontend dans `types/index.ts` contient les memes 5 valeurs
3. Le type `UserManagement.role` est mis a jour pour inclure `ACCOUNTANT`
4. Toutes les references a `SUPER_ADMIN`, `STAFF`, `ADMIN` dans le frontend sont remplacees
5. La sidebar utilise les noms de roles exacts du backend
6. Le hook `useAuth.hasRole()` fonctionne avec les nouveaux noms
7. La page `admin/users` affiche et permet de creer le role `ACCOUNTANT`

**Integration Verification :**
- IV1 : Un utilisateur existant avec role `SUPERADMIN` peut toujours se connecter
- IV2 : La sidebar affiche les memes menus qu'avant pour un `CLINIC_ADMIN`
- IV3 : Aucune erreur TypeScript liee aux roles dans le build

### Story 1.2 — Ajouter le role ACCOUNTANT au backend

> En tant que CLINIC_ADMIN,
> je veux pouvoir creer un utilisateur avec le role ACCOUNTANT,
> afin que le comptable de ma clinique ait un compte dedie.

**Acceptance Criteria :**
1. Le role `ACCOUNTANT` est ajoute a l'enum `AuthUserRole`
2. Les controllers billing (invoices, payments, expenses, tariffs) incluent `ACCOUNTANT` dans leurs `@Roles()`
3. Le `ACCOUNTANT` a acces en lecture/ecriture aux factures, paiements, depenses
4. Le `ACCOUNTANT` a acces en lecture aux tarifs
5. Le `ACCOUNTANT` n'a PAS acces aux endpoints patients, encounters, prescriptions, lab-results
6. Le `ACCOUNTANT` peut voir les stats de depenses (`GET /expenses/stats`)
7. Le `CreateUserDto` accepte le role `ACCOUNTANT`

**Integration Verification :**
- IV1 : Un `EMPLOYEE` existant conserve ses acces actuels inchanges
- IV2 : Les endpoints billing retournent les memes donnees qu'avant pour un `CLINIC_ADMIN`
- IV3 : Un `ACCOUNTANT` recoit un 403 sur `GET /patients`

### Story 1.3 — Corriger l'isolation multi-tenant

> En tant qu'operateur de la plateforme,
> je veux que chaque clinique ne puisse acceder qu'a ses propres donnees,
> afin de garantir la confidentialite medicale entre tenants.

**Acceptance Criteria :**
1. `EncountersService.findOne(id)` filtre par `tenantId`
2. Tous les `findOne()` des services (patients, prescriptions, lab-results, invoices, payments) verifient le `tenantId`
3. Le `TenantGuard` utilise `user.role === AuthUserRole.SUPERADMIN` au lieu de `user.isAdmin`
4. Les endpoints publics (`/public/wait-queue`, `/public/patients/:tenantId`) valident que le tenant existe et est actif
5. Un test verifie qu'un utilisateur du tenant A ne peut pas acceder aux encounters du tenant B

**Integration Verification :**
- IV1 : Les consultations existantes restent accessibles pour les utilisateurs de leur propre tenant
- IV2 : La file d'attente publique fonctionne toujours pour un tenant valide
- IV3 : Pas de degradation de performance sur les requetes

### Story 1.4 — Corrections de securite critiques

> En tant qu'operateur de la plateforme,
> je veux que les failles de securite connues soient corrigees,
> afin de pouvoir deployer en production en toute confiance.

**Acceptance Criteria :**
1. CORS configure via `CORS_ORIGINS` env var (ex: `https://app.clinoo.com,https://admin.clinoo.com`)
2. Les secrets JWT sont dans `.env` (non commite) et un `.env.example` documente les variables requises
3. Le fichier `.env` actuel avec les vrais secrets est ajoute au `.gitignore`
4. Rate limiting actif sur `/auth/login`, `/auth/refresh`, `/auth/practitioner/login` : 10 req/min/IP
5. Le package `@nestjs/throttler` est installe et configure

**Integration Verification :**
- IV1 : Le login fonctionne normalement pour un utilisateur legitime
- IV2 : Apres 10 tentatives echouees, la 11eme retourne un 429 Too Many Requests
- IV3 : Les requetes depuis le domaine autorise passent le CORS, les autres sont rejetees

### Story 1.5 — Nettoyer les services dupliques du frontend

> En tant que developpeur,
> je veux supprimer les services dupliques et standardiser sur le pattern apiClient,
> afin de reduire la confusion et garantir le refresh token automatique sur tous les appels API.

**Acceptance Criteria :**
1. `services/auth-service.ts` est supprime — toutes les pages utilisent `services/auth.service.ts`
2. `services/appointment-service.ts` est supprime — toutes les pages utilisent `services/appointment.service.ts`
3. `services/api-service.ts` est supprime
4. `services/patient.service.ts` est migre du pattern `fetch + getAuthHeaders()` vers `apiClient`
5. L'import manquant `RegisterData` est resolu (fichier supprime)
6. Aucune page ne reference les anciens services

**Integration Verification :**
- IV1 : La page patients charge et affiche les patients correctement
- IV2 : La page appointments fonctionne avec le service standardise
- IV3 : Le refresh token fonctionne sur les appels patient.service

---

## 7. Epic 2 : Interfaces dediees par role

**Epic Goal :** Creer des espaces de travail dedies pour chaque role, avec une navigation et un dashboard adaptes.

**Integration Requirements :** Necessite Epic 1 complete (roles harmonises, securite corrigee). Modifications frontend uniquement.

### Story 2.1 — Sidebar dynamique filtree par role

> En tant qu'utilisateur connecte,
> je veux voir uniquement les menus correspondant a mon role,
> afin de ne pas etre distrait par des fonctionnalites qui ne me concernent pas.

**Acceptance Criteria :**
1. Le `SUPERADMIN` voit uniquement : Dashboard Admin, Tenants & Cliniques, Utilisateurs, Permissions
2. Le `CLINIC_ADMIN` voit : Dashboard, Patients, Praticiens, Consultations (sous-menu), Planification (sous-menu), Comptabilite (sous-menu), Utilisateurs de la clinique
3. Le `PRACTITIONER` voit : Mon Dashboard, Mes Patients, Mon Planning, Consultations, Prescriptions, Resultats labo
4. Le `EMPLOYEE` voit : Dashboard, Patients, Planification, File d'attente, Facturation
5. Le `ACCOUNTANT` voit : Dashboard Comptable, Factures, Paiements, Depenses, Tarifs & Prix
6. Le menu est reactif (mobile overlay, desktop persistent) comme actuellement

**Integration Verification :**
- IV1 : Le CLINIC_ADMIN voit les memes fonctionnalites qu'avant (pas de regression)
- IV2 : La sidebar mobile fonctionne correctement pour tous les roles
- IV3 : Le breadcrumb genere automatiquement reste coherent

### Story 2.2 — Dashboard SUPERADMIN dedie

> En tant que SUPERADMIN,
> je veux un dashboard affichant uniquement les informations systeme,
> afin de gerer la plateforme sans etre distrait par les donnees cliniques.

**Acceptance Criteria :**
1. Nouvelle page `/admin/dashboard` avec header gradient et message de bienvenue
2. 4 stat cards : Tenants actifs, Total utilisateurs, Cliniques actives, Utilisateurs inactifs
3. Liste des derniers tenants crees avec statut (actif/inactif)
4. Actions rapides : Creer un tenant, Gerer les utilisateurs, Voir les permissions
5. Aucune reference a patients, RDV, revenus ou consultations
6. Apres login d'un SUPERADMIN, redirection automatique vers `/admin/dashboard`

**Integration Verification :**
- IV1 : Les donnees sont chargees depuis `TenantService.getTenants()` et `TenantService.getUsers()`
- IV2 : Le dashboard utilise les composants shadcn/ui et le theme brand existant
- IV3 : Pas d'erreur 403 sur les appels API

### Story 2.3 — Dashboard PRACTITIONER avec donnees reelles

> En tant que praticien,
> je veux voir mes vrais rendez-vous, patients et consultations sur mon dashboard,
> afin de travailler efficacement sans donnees fictives.

**Acceptance Criteria :**
1. Remplacement des donnees hardcodees par des appels API : appointments, patients, encounters filtres par `practitionerId`
2. Section "Mes RDV du jour" avec donnees reelles et horaires
3. Section "Activite recente" avec les dernieres consultations, prescriptions, RDV
4. Stat cards avec donnees API : RDV aujourd'hui, Patients actifs, Consultations cette semaine
5. Etat de chargement (skeleton) pendant le fetch
6. Etat vide si aucun RDV ("Aucun rendez-vous aujourd'hui")
7. Actions rapides avec liens vers : Nouveau RDV, Nouvelle consultation, Mes patients

**Integration Verification :**
- IV1 : Le dashboard charge sans erreur meme si le praticien n'a aucun RDV
- IV2 : Les donnees affichees correspondent uniquement au praticien connecte
- IV3 : Le pattern visuel est identique aux autres dashboards

### Story 2.4 — Dashboard et interface ACCOUNTANT

> En tant que comptable,
> je veux un espace dedie avec uniquement les outils financiers,
> afin de gerer la comptabilite sans acceder aux donnees cliniques.

**Acceptance Criteria :**
1. Dashboard `/accounting/dashboard` avec : Revenus du mois, Depenses du mois, Factures en attente, Solde net
2. Widget repartition des depenses par categorie
3. Widget dernieres factures avec statut (badge colore)
4. Widget derniers paiements recus
5. Actions rapides : Nouvelle depense, Nouvelle facture, Voir les tarifs
6. Apres login d'un ACCOUNTANT, redirection automatique vers `/accounting/dashboard`
7. Le ACCOUNTANT ne peut pas naviguer vers `/patients`, `/encounters`, `/practitioners`

**Integration Verification :**
- IV1 : Les donnees financieres sont chargees depuis les services billing et expenses
- IV2 : Le dashboard utilise les composants et le theme existants
- IV3 : Un ACCOUNTANT qui tape `/patients` dans l'URL est redirige vers `/accounting/dashboard`

### Story 2.5 — Middleware de protection des routes par role

> En tant qu'operateur de la plateforme,
> je veux que chaque role ne puisse acceder qu'a ses routes autorisees,
> afin d'empecher l'acces non autorise meme en tapant l'URL directement.

**Acceptance Criteria :**
1. Definition d'une map role → routes autorisees
2. `SUPERADMIN` : uniquement `/admin/*`
3. `ACCOUNTANT` : uniquement `/accounting/*`, `/profile`
4. `PRACTITIONER` : `/practitioner/*`, `/patients`, `/encounters`, `/appointments`, `/profile`
5. `EMPLOYEE` : `/dashboard`, `/patients`, `/appointments`, `/queue/*`, `/accounting/invoices`, `/profile`
6. `CLINIC_ADMIN` : toutes les routes cliniques + `/admin/users` (pour sa clinique)
7. Redirection vers le dashboard du role si acces non autorise
8. Les routes publiques restent accessibles sans authentification

**Integration Verification :**
- IV1 : Les pages existantes restent accessibles pour les roles autorises
- IV2 : Le hook `useAuth` est utilise dans les pages comme deuxieme couche de protection
- IV3 : Les routes publiques (queue, legal) ne sont pas impactees

### Story 2.6 — Page Profil utilisateur

> En tant qu'utilisateur connecte (tout role),
> je veux pouvoir voir et modifier mon profil et changer mon mot de passe,
> afin de gerer mon compte de maniere autonome.

**Acceptance Criteria :**
1. Nouvelle page `/profile` accessible a tous les roles
2. Affichage des infos : prenom, nom, email, role (lecture seule), tenant (lecture seule)
3. Formulaire de modification : prenom, nom, email (avec validation Zod)
4. Section changement de mot de passe : ancien mot de passe, nouveau, confirmation
5. Nouveau endpoint backend `PATCH /auth/profile` pour la mise a jour du profil
6. Nouveau endpoint backend `POST /auth/change-password` avec validation de l'ancien mot de passe
7. Toast de succes/erreur apres chaque action
8. Lien vers la page profil dans le menu utilisateur (user-nav dropdown dans le header)

**Integration Verification :**
- IV1 : Le profil affiche les bonnes donnees pour un user et pour un practitioner
- IV2 : Le changement de mot de passe fonctionne et le nouveau mot de passe est utilisable au login suivant
- IV3 : Les endpoints sont proteges par `JwtAuthGuard`

---

## 8. Epic 3 : Fonctionnalites complementaires

**Epic Goal :** Ajouter les fonctionnalites manquantes identifiees lors de l'analyse, pour ameliorer la fiabilite et l'experience utilisateur.

**Integration Requirements :** Peut etre demarre en parallele de l'Epic 2 (sauf Story 3.4 qui necessite le header modifie). Necessite Epic 1 complete.

### Story 3.1 — Detection de doublons patients

> En tant que receptionniste (EMPLOYEE),
> je veux etre averti si un patient similaire existe deja lors de la creation,
> afin d'eviter les dossiers en double.

**Acceptance Criteria :**
1. Lors de la saisie du nom et de la date de naissance, un appel API recherche les correspondances
2. Si des doublons potentiels sont trouves, un dialog affiche la liste avec : nom, prenom, date de naissance, MRN
3. L'utilisateur peut choisir "C'est un nouveau patient" pour continuer ou "Voir le dossier" pour ouvrir le patient existant
4. La recherche de doublons est debounced (300ms)
5. Nouveau endpoint backend `GET /patients/check-duplicate?firstName=&lastName=&dob=`

**Integration Verification :**
- IV1 : La creation de patient fonctionne normalement si aucun doublon n'est trouve
- IV2 : Le formulaire patient existant n'est pas casse
- IV3 : La recherche de doublons respecte l'isolation tenant

### Story 3.2 — Detection de conflits de RDV

> En tant qu'utilisateur creant un RDV,
> je veux etre bloque si le praticien a deja un RDV au meme creneau,
> afin d'eviter les doubles reservations.

**Acceptance Criteria :**
1. Avant de creer un RDV, le backend verifie qu'aucun RDV existant (statut != CANCELLED) ne chevauche le creneau
2. Si conflit, le backend retourne une erreur 409 Conflict avec le detail du RDV existant
3. Le frontend affiche un message d'erreur clair en francais
4. Verification aussi lors de la modification d'un RDV (reschedule)

**Integration Verification :**
- IV1 : La creation de RDV sans conflit fonctionne normalement
- IV2 : Les RDV annules ne sont pas consideres comme des conflits
- IV3 : Performance : la verification ajoute moins de 100ms a la requete

### Story 3.3 — Vues d'impression pour prescriptions et factures

> En tant que praticien ou comptable,
> je veux pouvoir imprimer une prescription ou une facture avec un format professionnel,
> afin de fournir des documents papier propres aux patients.

**Acceptance Criteria :**
1. Bouton "Imprimer" sur la page detail de prescription et la page detail de facture
2. CSS `@media print` masquant sidebar, header, breadcrumbs
3. En-tete d'impression : nom de la clinique, adresse, telephone, logo
4. Prescription : informations patient, liste des medicaments, signature du praticien, QR code
5. Facture : informations patient, lignes de facturation, totaux, QR code, conditions de paiement
6. Format A4 portrait

**Integration Verification :**
- IV1 : L'impression depuis Chrome produit un document A4 lisible
- IV2 : Le contenu de la page reste identique hors mode impression
- IV3 : Le QR code existant est inclus dans l'impression

### Story 3.4 — Centre de notifications in-app

> En tant qu'utilisateur connecte,
> je veux voir les notifications recentes dans le header,
> afin d'etre informe des evenements importants sans quitter ma page.

**Acceptance Criteria :**
1. Icone cloche dans le header avec badge compteur de notifications non lues
2. Dropdown affichant les 10 dernieres notifications
3. Types de notifications : nouveau RDV, facture en attente, patient en file d'attente, RDV annule
4. Clic sur une notification redirige vers la page concernee
5. Bouton "Tout marquer comme lu"
6. Les notifications sont filtrees par role
7. Implementation initiale : notifications generees cote frontend a partir des donnees existantes (pas de backend de notifications pour le MVP)

**Integration Verification :**
- IV1 : Le header conserve sa mise en page actuelle
- IV2 : Les notifications ne surchargent pas les appels API (polling toutes les 60s max)
- IV3 : Le dropdown est responsive et fonctionne sur mobile

### Story 3.5 — Error Boundary global

> En tant qu'utilisateur,
> je veux voir une page d'erreur comprehensible en francais si quelque chose plante,
> afin de ne pas etre confronte a un ecran blanc sans explication.

**Acceptance Criteria :**
1. Composant `ErrorBoundary` React ajoute au `MainLayout`
2. En cas d'erreur non geree : icone d'erreur, message "Une erreur inattendue s'est produite", bouton "Recharger la page", bouton "Retour au tableau de bord"
3. L'erreur est loguee dans la console en mode developpement
4. Le composant ne capture pas les erreurs d'authentification

**Integration Verification :**
- IV1 : L'application fonctionne normalement quand aucune erreur ne se produit
- IV2 : Une erreur dans un composant enfant est capturee et affiche la page d'erreur
- IV3 : Le bouton "Recharger" restaure l'application dans un etat fonctionnel

---

## Summary

| Epic | Stories | Priorite | Prerequis |
|------|---------|----------|-----------|
| **Epic 1 — Fondations** | 1.1 Roles, 1.2 ACCOUNTANT, 1.3 Tenant, 1.4 Securite, 1.5 Nettoyage | Critique | Aucun |
| **Epic 2 — Interfaces** | 2.1 Sidebar, 2.2 Dashboard SA, 2.3 Dashboard Praticien, 2.4 Dashboard Comptable, 2.5 Middleware, 2.6 Profil | Haute | Epic 1 |
| **Epic 3 — Complementaire** | 3.1 Doublons, 3.2 Conflits RDV, 3.3 Impressions, 3.4 Notifications, 3.5 Error Boundary | Moyenne | Epic 1 |

**Total : 3 epics, 16 stories**
