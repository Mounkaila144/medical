# Project Brief: Clinoo+ - Plateforme de Gestion Medicale

## Executive Summary

**Clinoo+** est une plateforme SaaS multi-tenant de gestion de cliniques medicales au Niger, composee d'une application web (Next.js), d'une API backend (NestJS), et d'une application mobile (Flutter). Elle couvre la gestion des patients, rendez-vous, consultations cliniques (SOAP), prescriptions, resultats de laboratoire, facturation, comptabilite et file d'attente en temps reel.

**Probleme principal :** Le systeme actuel souffre d'incoherences structurelles heritees du developpement initial - les roles utilisateur ne sont pas correctement separes (le Super Admin voit les donnees cliniques, le praticien n'a pas d'espace propre, il n'existe pas de role comptable), les noms de roles divergent entre frontend et backend, et plusieurs services sont dupliques. Ces problemes empechent un deploiement fiable en production multi-cliniques.

**Marche cible :** Cliniques medicales privees au Niger, avec potentiel d'expansion en Afrique de l'Ouest francophone.

**Proposition de valeur :** Un outil tout-en-un, adapte au contexte nigerien (FCFA, francais, mobile-first), avec mode hors-ligne sur mobile et gestion multi-tenant permettant a un operateur de gerer plusieurs cliniques depuis une seule plateforme.

---

## Problem Statement

### Etat actuel et points de douleur

Le projet Clinoo+ est fonctionnel dans ses grandes lignes mais presente des problemes structurels qui bloquent un deploiement serieux en multi-cliniques :

**1. Roles utilisateur mal separes :**
- Le **Super Admin** (operateur plateforme) voit le meme dashboard que les employes de clinique : patients, rendez-vous, revenus. Il devrait uniquement gerer les tenants et les utilisateurs.
- Le **Praticien** (medecin) n'a pas d'espace propre abouti. Son dashboard contient des donnees hardcodees ("Marie Dubois", "Jean Martin") au lieu de vraies donnees API. Il ne peut pas se connecter de maniere autonome et travailler dans son espace.
- Il n'existe **aucun role Comptable**. Les fonctions de facturation, depenses et revenus sont accessibles au role EMPLOYEE, sans separation des responsabilites.

**2. Incoherences techniques :**
- Les noms de roles divergent entre backend (`SUPERADMIN`, `EMPLOYEE`) et frontend (`SUPER_ADMIN`, `STAFF`), causant des echecs silencieux dans les verifications de permissions.
- Services dupliques : `auth.service.ts` / `auth-service.ts`, `appointment.service.ts` / `appointment-service.ts` — confusion sur lequel utiliser.
- 137 utilisations de `any` dans le frontend TypeScript, annulant les benefices du typage.
- Import d'un type inexistant (`RegisterData` depuis `types/auth`).

**3. Failles de securite :**
- CORS ouvert a `origin: '*'` en production
- Secrets JWT hardcodes dans le repo (`m3d1calAccessS3cr3t2025`)
- Aucun rate limiting sur les endpoints d'authentification
- Isolation tenant defaillante : `EncountersService.findOne()` ne filtre pas par `tenantId`

**4. Fonctionnalites incompletes :**
- Pas de reset de mot de passe
- Pas de documentation API (Swagger)
- Pas de pagination sur la majorite des endpoints backend
- Dashboard praticien avec donnees fictives
- URL API hardcodee dans l'app mobile (3 fichiers)

### Impact

En l'etat, le systeme ne peut pas etre deploye de maniere fiable pour plusieurs cliniques. Un admin de clinique A pourrait potentiellement acceder aux consultations de la clinique B. Un praticien ne peut pas travailler efficacement. La comptabilite n'est pas separee des autres roles.

### Pourquoi les solutions existantes ne suffisent pas

Le projet a ete construit a la main dans sa totalite, ce qui est sa force (controle total, adapte au contexte nigerien) mais aussi sa faiblesse (accumulation d'incoherences sans revue systematique). Une refonte structuree via BMAD permettra de corriger ces fondations sans repartir de zero.

---

## Proposed Solution

### Approche globale

Une refonte structurelle du systeme existant, organisee en phases, sans repartir de zero. L'objectif est de consolider les fondations (roles, securite, coherence du code) puis d'enrichir les interfaces par role.

### Axes de la solution

**Axe 1 — Systeme de roles clarifie (5 roles distincts) :**

| Role | Perimetre | Dashboard |
|------|-----------|-----------|
| **SUPERADMIN** | Gestion des tenants, utilisateurs systeme, supervision globale | Nombre de tenants, users, cliniques actives |
| **CLINIC_ADMIN** | Gestion complete d'une clinique (patients, staff, praticiens, comptabilite, planning) | Vue complete de la clinique |
| **PRACTITIONER** | Ses patients, ses RDV, ses consultations, prescriptions, resultats labo | Ses RDV du jour, ses patients, activite recente |
| **EMPLOYEE** | Accueil patients, prise de RDV, file d'attente, gestion de dossiers | Patients, planning, file d'attente |
| **ACCOUNTANT** | Facturation, paiements, depenses, tarifs, rapports financiers | Revenus, depenses, factures en attente |

**Axe 2 — Harmonisation technique :**
- Alignement des noms de roles frontend/backend sur les valeurs backend (`SUPERADMIN`, `EMPLOYEE`, etc.)
- Suppression des services dupliques, standardisation sur le pattern `apiClient`
- Remplacement des 137 `any` par des types propres
- Correction de l'isolation multi-tenant

**Axe 3 — Securite :**
- Restriction CORS aux domaines autorises
- Externalisation des secrets JWT
- Ajout de rate limiting
- Validation tenant sur tous les endpoints

**Axe 4 — Interfaces dediees par role :**
- Sidebar dynamique filtree par role
- Dashboards specifiques avec donnees reelles (pas hardcodees)
- Redirection automatique apres login vers le bon dashboard selon le role

### Differenciateurs

- **Approche brownfield** : on ameliore l'existant, on ne reconstruit pas
- **Separation des responsabilites** : chaque role a exactement ce dont il a besoin, ni plus ni moins
- **Adapte au contexte** : FCFA, francais, mobile-first pour le Niger

---

## Target Users

### Segment primaire : Personnel de clinique medicale au Niger

**Profils :**

1. **Super Administrateur (operateur plateforme)**
   - Profil : Gerant technique ou proprietaire de la solution SaaS
   - Besoin : Gerer plusieurs cliniques depuis un panneau central, creer/desactiver des tenants, superviser les utilisateurs
   - Point de douleur actuel : Voit des donnees cliniques (patients, RDV) qui ne le concernent pas

2. **Administrateur de clinique (CLINIC_ADMIN)**
   - Profil : Directeur ou gerant d'une clinique privee
   - Besoin : Vue d'ensemble de SA clinique — staff, praticiens, patients, comptabilite, planification
   - Workflow : Configure la clinique, ajoute les praticiens, supervise l'activite quotidienne

3. **Praticien / Medecin (PRACTITIONER)**
   - Profil : Medecin generaliste ou specialiste exerçant dans une ou plusieurs cliniques
   - Besoin : Voir SES rendez-vous, gerer SES consultations (SOAP), prescrire, voir les resultats labo de SES patients
   - Point de douleur actuel : Dashboard avec donnees fictives, pas d'espace personnel fonctionnel

4. **Employe / Receptionniste (EMPLOYEE)**
   - Profil : Personnel d'accueil et administratif
   - Besoin : Enregistrer les patients, planifier les RDV, gerer la file d'attente, creer des factures
   - Workflow : Accueil patient → enregistrement → prise de RDV → file d'attente → facturation

5. **Comptable (ACCOUNTANT)**
   - Profil : Responsable financier de la clinique
   - Besoin : Saisir les depenses, suivre les revenus, gerer les factures et paiements, configurer les tarifs
   - Point de douleur actuel : Ce role n'existe pas — le comptable utilise un compte EMPLOYEE avec acces a des donnees cliniques inutiles

### Segment secondaire : Patients (via mobile et file d'attente publique)

- Profil : Patients des cliniques, souvent peu familiers avec la technologie
- Interaction : Prise de numero via page publique de file d'attente (`/[tenantSlug]/queue/take-number`), affichage de leur position
- Besoin : Interface simple, rapide, en francais

---

## Goals & Success Metrics

### Business Objectives

- **Deployer en production multi-tenant** avec au moins 3 cliniques distinctes sans fuite de donnees inter-tenant
- **Reduire le temps d'onboarding** d'une nouvelle clinique a moins de 30 minutes (creation tenant + admin + configuration)
- **Permettre l'autonomie des praticiens** : un medecin doit pouvoir se connecter et travailler sans assistance technique
- **Separer la comptabilite** : le comptable a son propre espace, les donnees financieres ne fuient pas vers les roles cliniques

### User Success Metrics

- Le SUPERADMIN ne voit aucune donnee clinique (patients, RDV, consultations) dans son interface
- Le PRACTITIONER accede a ses RDV et consultations en moins de 2 clics depuis son dashboard
- Le ACCOUNTANT peut saisir une depense et consulter les revenus du mois sans acceder aux dossiers patients
- L'EMPLOYEE peut enregistrer un patient et planifier un RDV en moins de 3 minutes

### Key Performance Indicators (KPIs)

- **Coherence des roles** : 0 mismatch entre les noms de roles frontend et backend
- **Isolation tenant** : 100% des endpoints de donnees filtrent par `tenantId`
- **Couverture securite** : 0 secret hardcode dans le repo, CORS restreint, rate limiting actif
- **Type safety** : Reduction des `any` de 137 a moins de 10
- **Services unifies** : 0 service duplique dans le frontend

---

## MVP Scope

### Core Features (Must Have)

- **Systeme de 5 roles harmonises** : SUPERADMIN, CLINIC_ADMIN, EMPLOYEE, PRACTITIONER, ACCOUNTANT — coherents entre frontend, backend et mobile
- **Sidebar dynamique par role** : chaque role voit uniquement les menus qui le concernent
- **Dashboard SUPERADMIN dedie** : stats globales (tenants, users, cliniques), actions rapides (creer tenant), PAS de donnees cliniques
- **Dashboard PRACTITIONER fonctionnel** : donnees reelles via API (ses RDV du jour, ses patients, son activite)
- **Dashboard/Interface ACCOUNTANT** : acces facturation, paiements, depenses, tarifs, rapports financiers uniquement
- **Harmonisation des roles frontend/backend** : aligner `UserRole` enum sur les valeurs backend, supprimer les references a `SUPER_ADMIN`, `STAFF`, `ADMIN`
- **Correction isolation multi-tenant** : tous les `findOne()` et endpoints doivent filtrer par `tenantId`
- **Corrections securite critiques** : CORS restreint, secrets JWT externalises, rate limiting sur `/auth/*`
- **Nettoyage des services dupliques** : supprimer les anciens services (`auth-service.ts`, `appointment-service.ts`, `api-service.ts`), standardiser sur `apiClient`
- **Correction de l'import manquant** (`RegisterData`) et des erreurs TypeScript bloquantes

### Out of Scope for MVP

- 2FA/MFA (authentification multi-facteur)
- Notifications email/SMS
- API versioning
- Documentation Swagger complete
- Reset de mot de passe self-service
- Pagination complete sur tous les endpoints
- Migration de la base de donnees locale mobile (chiffrement)
- Internationalisation (multi-langues)
- Application iOS (actuellement Android seulement)
- Webhook et integrations tierces
- Module inventaire (existe mais non prioritaire)
- Module RH (existe mais non prioritaire)

### MVP Success Criteria

Le MVP est reussi quand :
1. Un SUPERADMIN peut creer un tenant, y ajouter un CLINIC_ADMIN, et ne voit aucune donnee clinique
2. Un CLINIC_ADMIN peut ajouter des EMPLOYEE, PRACTITIONER et ACCOUNTANT dans sa clinique
3. Un PRACTITIONER se connecte et voit SES RDV et consultations avec des donnees reelles
4. Un ACCOUNTANT se connecte et accede uniquement a la comptabilite
5. Aucune fuite de donnees entre tenants (verification par tests)
6. Les noms de roles sont identiques frontend/backend
7. Zero service duplique dans le frontend

---

## Post-MVP Vision

### Phase 2 Features

- **Reset de mot de passe self-service** avec envoi par email
- **Documentation API Swagger** auto-generee depuis les DTOs NestJS
- **Pagination** sur tous les endpoints de liste (patients, appointments, invoices, etc.)
- **Suppression des 137 `any`** restants dans le frontend (typage strict)
- **Configuration d'environnement mobile** : remplacement des URLs hardcodees par un systeme de config (dev/staging/prod)
- **Indicateurs offline ameliores** sur l'app mobile (banniere sur les formulaires)
- **Audit log fonctionnel** : l'entite AuditLog existe mais n'est jamais alimentee — implementer les listeners

### Long-term Vision (6-12 mois)

- **2FA/MFA** pour les roles sensibles (SUPERADMIN, CLINIC_ADMIN, ACCOUNTANT)
- **Notifications email/SMS** pour les RDV (rappels), les factures (echeances), les alertes stock
- **Module inventaire operationnel** : gestion des medicaments, consommables, alertes de stock bas
- **Module RH complet** : conges, planning des shifts, fiches de paie
- **Rapports avancees** : rapports financiers exportables (PDF/Excel), tableaux de bord analytiques
- **Application iOS** : build Flutter pour iOS
- **API versioning** (v1/v2) pour la retrocompatibilite mobile

### Expansion Opportunities

- **Multi-pays Afrique de l'Ouest** : Senegal, Mali, Burkina Faso, Cote d'Ivoire (meme zone FCFA/XOF)
- **Marketplace de specialistes** : mise en relation inter-cliniques pour les specialites rares
- **Teleconsultation** : integration video pour les consultations a distance (zones rurales du Niger)
- **Integration CNAM** : connexion avec la Caisse Nationale d'Assurance Maladie du Niger
- **Mode SaaS public** : permettre a des cliniques de s'inscrire en self-service avec plans d'abonnement (FREE, BASIC, PROFESSIONAL, ENTERPRISE — deja modeles dans le code)

---

## Technical Considerations

### Platform Requirements

- **Target Platforms :** Web (desktop + mobile responsive), Android (Flutter), API REST + GraphQL
- **Browser Support :** Chrome, Firefox, Safari, Edge (versions recentes)
- **Performance Requirements :** Temps de chargement < 3s sur connexion 3G, mode offline sur mobile

### Technology Stack (existant, a conserver)

- **Frontend Web :** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend :** NestJS, TypeORM, PostgreSQL/MySQL, GraphQL (Apollo), JWT auth
- **Mobile :** Flutter 3.x, Dart, Riverpod, Drift (SQLite), GoRouter
- **Infra :** PM2, RabbitMQ, MinIO (stockage objets), Socket.io (queue temps reel)
- **DevOps :** Docker, docker-compose

### Architecture Considerations

- **Repository Structure :** Monorepo avec frontend web a la racine et backend dans `medicalBackend/`. App mobile dans un repo separe (`clinoo`).
- **Service Architecture :** Monolithe NestJS modulaire (auth, patients, scheduling, ehr, billing, inventory, hr, analytics). Pas de microservices pour l'instant.
- **Integration Requirements :** RabbitMQ (messaging async), MinIO (documents/PDFs), Socket.io (queue real-time)
- **Security/Compliance :** Isolation tenant obligatoire, JWT avec refresh tokens, CORS restreint, donnees medicales sensibles (RGPD/conformite locale a verifier)

---

## Constraints & Assumptions

### Constraints

- **Budget :** Projet personnel / startup — pas de budget pour des services tiers couteux. Hebergement sur serveur propre (VPS)
- **Timeline :** Pas de deadline externe stricte, mais objectif de deploiement production dans les prochains mois
- **Resources :** Developpeur principal seul (Mounkaila) + assistance Claude Code. Pas d'equipe QA dediee
- **Technical :** Base de donnees MySQL en production (pas PostgreSQL), Flutter Android seulement, export statique Next.js

### Key Assumptions

- Le backend NestJS existant est globalement solide en architecture — on corrige et ameliore, on ne reconstruit pas
- Les entites TypeORM et les relations sont correctes — les problemes sont dans les guards, les controllers et le frontend
- Le mode offline de l'app mobile (Drift + SyncEngine) fonctionne correctement et n'a pas besoin de refonte
- Le systeme de file d'attente (Socket.io) est fonctionnel
- Les modules inventaire et RH existent mais ne sont pas prioritaires pour le MVP
- L'authentification dual (User + Practitioner) via JWT est un choix architectural a conserver

---

## Risks & Open Questions

### Key Risks

- **Fuite de donnees inter-tenant** : Certains endpoints ne filtrent pas par tenantId. Risque eleve tant que non corrige. Impact : violation de confidentialite medicale.
- **Migration des donnees existantes** : Si des cliniques utilisent deja le systeme, le changement de noms de roles (SUPER_ADMIN → SUPERADMIN, STAFF → EMPLOYEE) pourrait casser les sessions/tokens existants.
- **Regression lors du nettoyage** : La suppression des services dupliques et le remplacement des `any` pourraient introduire des regressions sans suite de tests.
- **Complexite du routing par role** : 5 roles avec 5 dashboards et sidebars differentes augmente la complexite du middleware et de la navigation.
- **Coherence mobile** : L'app Flutter a ses propres modeles et enum — les changements backend doivent etre refletes dans le mobile aussi.

### Open Questions

- Y a-t-il des cliniques qui utilisent deja le systeme en production ? Si oui, quelle strategie de migration pour les roles ?
- Le praticien connecte via `/auth/practitioner/login` utilise-t-il un compte User avec role PRACTITIONER, ou un compte Practitioner separe ? Les deux chemins coexistent — lequel garder ?
- Faut-il que le ACCOUNTANT puisse voir les noms des patients sur les factures, ou seulement les montants anonymises ?
- Le module GraphQL est-il utilise par le mobile ou uniquement par le web ? Faut-il le maintenir ?
- Quel est le plan pour le chiffrement de la base SQLite sur mobile (donnees medicales sensibles) ?

### Areas Needing Further Research

- Conformite RGPD / reglementation nigerienne sur les donnees de sante
- Benchmark de performance : combien de patients/cliniques le systeme supporte-t-il avant pagination obligatoire ?
- Integration avec les systemes d'assurance maladie nigeriens (CNAM)
- Strategie de backup et disaster recovery pour les donnees medicales

---

## Appendices

### A. Research Summary — Analyse technique du codebase

**Frontend Web (Next.js) :**
- 25+ pages/routes, 50+ composants, 12 services
- shadcn/ui complet, React Hook Form + Zod
- Problemes : 137 `any`, services dupliques, import manquant, roles incoherents

**Backend (NestJS) :**
- 8 modules (auth, patients, scheduling, ehr, billing, inventory, hr, analytics)
- 40 entites, 38 DTOs, JWT auth avec refresh tokens
- Problemes : CORS `*`, secrets hardcodes, isolation tenant incomplete, pas de rate limiting, pas de Swagger

**Mobile (Flutter) :**
- 270 fichiers Dart, 22 tables Drift, offline-first avec SyncEngine
- Riverpod, GoRouter, dual auth
- Problemes : URLs hardcodees, pas d'indicateur offline sur formulaires, pas de pagination

### B. Stakeholder Input

- Le proprietaire du projet (Mounkaila) a exprime les besoins suivants :
  - Interface Super Admin dediee (pas de donnees cliniques)
  - Comptes praticiens autonomes avec leur propre espace
  - Role comptable separe pour la saisie des depenses et le suivi financier
  - Correction de toutes les incoherences et dysfonctionnements
  - Approche structuree via BMAD

### C. References

- Codebase frontend : `C:\Users\Mounkaila\PhpstormProjects\medical`
- Codebase backend : `C:\Users\Mounkaila\PhpstormProjects\medical\medicalBackend`
- Codebase mobile : `C:\Users\Mounkaila\WebstormProjects\clinoo`
- BMAD Core : `.bmad-core/` (v4.44.3)

---

## Next Steps

### Immediate Actions

1. **Valider ce brief** avec le proprietaire du projet
2. **Passer au PO** (`/po`) pour generer le PRD detaille a partir de ce brief
3. **Passer a l'architecte** (`/architect`) pour valider/mettre a jour l'architecture technique
4. **Creer les stories** (`/sm`) pour decouper le travail en increments livrables
5. **Implementer** (`/dev`) en suivant les stories priorisees
6. **Valider** (`/qa`) chaque increment

### PM Handoff

Ce Project Brief fournit le contexte complet pour **Clinoo+**. Veuillez demarrer en mode 'PRD Generation Mode', revoir le brief en profondeur et travailler avec l'utilisateur pour creer le PRD section par section, en demandant toute clarification necessaire ou en suggerant des ameliorations.
