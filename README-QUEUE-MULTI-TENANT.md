# Système de File d'Attente Multi-Tenant

## 📋 Vue d'ensemble

Le système de file d'attente supporte maintenant une architecture **multi-tenant**, permettant à chaque clinique d'avoir ses propres pages publiques avec des URLs dédiées.

## 🌐 Structure des URLs

### Pages publiques par tenant (sans authentification)

Chaque clinique a ses propres URLs publiques basées sur son `tenantSlug` :

```
https://votredomaine.com/[tenantSlug]/queue/display
https://votredomaine.com/[tenantSlug]/queue/take-number
```

**Exemples concrets :**
```
https://votredomaine.com/clinique-centrale/queue/display
https://votredomaine.com/clinique-centrale/queue/take-number

https://votredomaine.com/hopital-nord/queue/display
https://votredomaine.com/hopital-nord/queue/take-number
```

### Page protégée (avec authentification)

La page de gestion reste une route protégée commune :

```
https://votredomaine.com/queue/manage
```

## 🗂️ Structure des fichiers

```
app/
  [tenantSlug]/              # Route dynamique pour multi-tenant
    queue/
      display/
        page.tsx             # Affichage public de la file d'attente
      take-number/
        page.tsx             # Prise de numéro anonyme
  queue/
    manage/
      page.tsx               # Gestion protégée (ancien système)
```

## 🔒 Sécurité et accès

### Routes publiques (aucune authentification requise)
- `/:tenantSlug/queue/display` - Affichage en temps réel de la file d'attente
- `/:tenantSlug/queue/take-number` - Prise de numéro anonyme

### Routes protégées (authentification requise)
- `/queue/manage` - Gestion de la file d'attente (staff uniquement)

## 🚀 Utilisation

### Pour un administrateur de clinique

1. **Obtenir le slug de votre tenant**
   - Disponible dans les paramètres de votre clinique
   - Format : lettres minuscules, chiffres et tirets (ex: `clinique-paris-15`)

2. **Générer des QR codes**
   - URL d'affichage : `https://votredomaine.com/[votre-slug]/queue/display`
   - URL de prise de numéro : `https://votredomaine.com/[votre-slug]/queue/take-number`

3. **Configuration des écrans**
   - Ouvrir l'URL d'affichage sur l'écran public
   - Cliquer sur "Activer le plein écran" pour une meilleure expérience

### Pour les patients

1. Scanner le QR code ou accéder à l'URL de prise de numéro
2. Cliquer sur "Prendre un numéro"
3. Recevoir leur ticket et patienter
4. Observer l'écran d'affichage pour leur numéro

## 🔧 Configuration technique

### Middleware

Le middleware (`middleware.ts`) gère automatiquement :
- Les routes publiques multi-tenant via regex patterns
- La redirection vers login pour les routes protégées
- L'isolation des données par tenant

```typescript
const publicTenantRoutePatterns = [
  /^\/[^/]+\/queue\/take-number$/,
  /^\/[^/]+\/queue\/display$/,
];
```

### MainLayout

Le layout principal détecte automatiquement les pages publiques et masque la sidebar :

```typescript
const isPublicQueuePage =
  /^\/[^/]+\/queue\/display$/.test(pathname) ||
  /^\/[^/]+\/queue\/take-number$/.test(pathname);
```

### API Backend

Les appels API incluent automatiquement le `tenantSlug` :

```typescript
// Exemple pour take-number
const response = await fetch(
  `${apiUrl}/public/wait-queue?tenant=${tenantSlug}`,
  { method: 'POST', ... }
);
```

## 📱 Fonctionnalités

### Page d'affichage (`/display`)
- ✅ Affichage en temps réel du numéro appelé
- ✅ Liste des prochains numéros en attente
- ✅ Statistiques (nombre en attente, temps estimé)
- ✅ Mode plein écran
- ✅ Connexion WebSocket pour mises à jour instantanées
- ✅ Horloge et date en temps réel

### Page de prise de numéro (`/take-number`)
- ✅ Interface simple et intuitive
- ✅ Génération de ticket anonyme
- ✅ Affichage du numéro obtenu
- ✅ Mode plein écran

### Page de gestion (`/manage`)
- ✅ Appeler le prochain patient
- ✅ Gérer les tickets (compléter, annuler)
- ✅ Vue d'ensemble de la file d'attente
- ✅ Filtres et recherche

## 🎨 Personnalisation par tenant

Pour personnaliser l'affichage par tenant (futur) :

1. Ajouter les informations de branding dans la table `tenants`
2. Récupérer les données via l'API
3. Appliquer les styles dynamiquement

```typescript
// Exemple futur
const { data: tenant } = await TenantService.getTenantBySlug(tenantSlug);

// Appliquer logo, couleurs, nom personnalisé
<h1>{tenant.name}</h1>
<div style={{ backgroundColor: tenant.primaryColor }}>...</div>
```

## 🔄 Migration depuis l'ancien système

Les anciennes URLs avec query params sont **toujours supportées** mais **dépréciées** :

❌ **Ancien format (déprécié)** :
```
/queue/display?tenant=xxx
/queue/take-number?tenant=xxx
```

✅ **Nouveau format (recommandé)** :
```
/[tenantSlug]/queue/display
/[tenantSlug]/queue/take-number
```

## 🧪 Tests

### URLs de test en développement

Avec le serveur sur `http://localhost:3002` :

```bash
# Exemple avec tenant "test-clinic"
http://localhost:3002/test-clinic/queue/display
http://localhost:3002/test-clinic/queue/take-number

# Page de gestion (protégée)
http://localhost:3002/queue/manage
```

### Validation du tenant

Le système vérifie automatiquement :
- Que le tenant existe dans la base de données
- Que le tenant est actif
- Les données sont isolées par tenant

## 📊 Avantages du système multi-tenant

1. **Isolation des données** - Chaque clinique a sa propre file d'attente
2. **URLs propres** - Facile à mémoriser et partager
3. **QR codes uniques** - Chaque clinique génère ses propres QR codes
4. **Personnalisation** - Possibilité d'adapter l'apparence par clinique
5. **Scalabilité** - Ajout facile de nouvelles cliniques
6. **SEO friendly** - URLs structurées et indexables

## 🚨 Points d'attention

1. **Validation du slug** - Toujours vérifier que le tenant existe avant d'afficher la page
2. **Gestion des erreurs** - Afficher un message clair si le tenant n'existe pas
3. **Performance** - Mettre en cache les données des tenants pour éviter les requêtes répétées
4. **Sécurité** - Les données sont strictement isolées par tenant dans le backend

## 📝 TODO / Améliorations futures

- [ ] Ajouter une page d'erreur 404 personnalisée pour les slugs invalides
- [ ] Implémenter la validation du tenant côté serveur (SSR)
- [ ] Ajouter la personnalisation du branding par tenant (logo, couleurs)
- [ ] Créer un générateur de QR codes dans l'interface admin
- [ ] Ajouter des analytics par tenant (nombre de tickets, temps d'attente moyen)
- [ ] Support des sous-domaines (ex: `clinique-a.votredomaine.com`)

## 📞 Support

Pour toute question concernant l'implémentation multi-tenant, consultez :
- `middleware.ts` - Routing et sécurité
- `components/layout/main-layout.tsx` - Gestion de l'affichage
- `app/[tenantSlug]/queue/*` - Pages publiques par tenant
