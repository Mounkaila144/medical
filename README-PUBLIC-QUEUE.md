# Pages Publiques de File d'Attente

## 🌐 Pages Accessibles Sans Authentification

### **1. Prise de Numéro**
**URL**: `http://localhost:3000/queue/take-number`

✅ **Accès public** (sans connexion)
✅ **Mode plein écran** automatique
✅ **Un seul bouton géant** : "Prendre un numéro"
✅ **100% anonyme** - Pas de nom, pas de recherche

**Fonctionnalités :**
- Cliquer sur le bouton génère un ticket (A001, A002, etc.)
- Affichage immédiat du numéro en très grand
- Bouton "Plein écran" en haut à droite pour toggle

---

### **2. Écran d'Affichage Public**
**URL**: `http://localhost:3000/queue/display`

✅ **Accès public** (sans connexion)
✅ **Mode plein écran** automatique
✅ **Mise à jour en temps réel** via WebSocket
✅ **Affichage du numéro appelé** en énorme (visible de loin)

**Fonctionnalités :**
- Numéro actuellement appelé en très grand (text-[12rem])
- Liste des 10 prochains numéros
- Statistiques (nombre en attente, temps estimé)
- Horloge en temps réel
- Bouton "Plein écran" en haut à droite

---

## ⚙️ Configuration Multi-Tenant

### **Tenant ID via URL (pour l'affichage public)**

Si vous avez plusieurs cliniques, vous pouvez spécifier le tenant via l'URL :

```
http://localhost:3000/queue/display?tenant=TENANT_ID_ICI
```

**Exemple :**
```
http://localhost:3000/queue/display?tenant=clinic-paris
http://localhost:3000/queue/display?tenant=clinic-lyon
```

### **Tenant ID par défaut**

Créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_DEFAULT_TENANT_ID=votre-tenant-id-par-defaut
```

Si aucun tenant n'est spécifié dans l'URL, ce tenant sera utilisé.

---

## 🖥️ Configuration pour Écrans Dédiés

### **Setup recommandé :**

#### **Borne de Prise de Numéro (Tablette/Écran tactile)**
1. Ouvrir : `http://localhost:3000/queue/take-number`
2. Cliquer sur "Plein écran"
3. Mode kiosque du navigateur :
   - **Chrome** : Lancer avec `--kiosk` flag
   - **Edge** : Mode kiosque dans les paramètres

```bash
# Windows - Chrome en mode kiosque
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk http://localhost:3000/queue/take-number

# Windows - Edge en mode kiosque
msedge --kiosk http://localhost:3000/queue/take-number
```

#### **Écran d'Affichage Public (TV/Grand écran)**
1. Ouvrir : `http://localhost:3000/queue/display?tenant=VOTRE_TENANT`
2. Cliquer sur "Plein écran"
3. Mode kiosque du navigateur

```bash
# Exemple avec tenant spécifique
chrome.exe --kiosk "http://localhost:3000/queue/display?tenant=clinic-123"
```

---

## 🔧 Configuration Backend (Sans Auth)

### **Endpoints Publics**

Pour que les pages fonctionnent sans authentification, vous devez configurer le backend pour accepter les requêtes publiques sur certains endpoints.

#### **Option 1: Guard personnalisé (Recommandé)**

Créez un guard qui permet les requêtes anonymes :

**Backend** : `src/common/guards/public-queue.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class PublicQueueGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Toujours autoriser
    return true;
  }
}
```

Puis appliquez-le au contrôleur :

```typescript
import { PublicQueueGuard } from '../../common/guards/public-queue.guard';

@Controller('wait-queue')
@UseGuards(PublicQueueGuard)  // Au lieu de JwtAuthGuard
export class WaitQueueController {
  // Les endpoints sont maintenant publics
}
```

#### **Option 2: Endpoints publics spécifiques**

Créez des endpoints dédiés pour l'accès public :

```typescript
@Controller('public/wait-queue')
export class PublicWaitQueueController {
  @Post()
  async takeNumber(@Body() data: { reason?: string }) {
    // Génère un ticket sans authentification
    // Utilise un tenant par défaut ou depuis la config
    return this.waitQueueService.enqueue(DEFAULT_TENANT_ID, {
      patientId: null,
      practitionerId: null,
      priority: 'NORMAL',
      reason: data.reason || 'Consultation',
    });
  }

  @Get()
  async getQueue() {
    return this.waitQueueService.getQueue(DEFAULT_TENANT_ID);
  }
}
```

---

## 🔒 Sécurité pour Accès Public

### **Limitations recommandées**

1. **Rate Limiting** : Limiter le nombre de tickets par IP
2. **CORS** : Configurer les domaines autorisés
3. **Validation** : Vérifier les requêtes malveillantes

**Exemple Rate Limiting** (backend) :

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('public/wait-queue')
@UseGuards(ThrottlerGuard)  // Limite : 10 requêtes par minute
export class PublicWaitQueueController {
  // ...
}
```

---

## 📱 Mode Plein Écran

### **Activation automatique**

Les pages tentent automatiquement d'entrer en mode plein écran au chargement.

⚠️ **Note** : Certains navigateurs bloquent le plein écran automatique pour des raisons de sécurité. Dans ce cas :
1. Cliquer sur le bouton "⛶ Plein écran" en haut à droite
2. Ou utiliser F11 (raccourci clavier)

### **Désactiver le plein écran automatique**

Si vous ne voulez pas le plein écran automatique, commentez le code :

```typescript
// Dans take-number/page.tsx et display/page.tsx
useEffect(() => {
  // Commenter cette fonction
  // const enterFullscreen = async () => { ... }
}, []);
```

---

## 🎯 Cas d'Usage

### **Scénario 1: Clinique avec une seule salle d'attente**

```
1 Borne de prise de numéro : /queue/take-number
1 Écran d'affichage : /queue/display
N Postes de gestion : /queue/manage (avec auth)
```

### **Scénario 2: Clinique multi-étages**

```
Étage 1:
- Borne : /queue/take-number
- Écran : /queue/display?tenant=etage1

Étage 2:
- Borne : /queue/take-number
- Écran : /queue/display?tenant=etage2
```

### **Scénario 3: Réseau de cliniques**

```
Clinique Paris:
- Toutes les pages avec ?tenant=clinic-paris

Clinique Lyon:
- Toutes les pages avec ?tenant=clinic-lyon
```

---

## 🐛 Dépannage

### **Erreur: "Unauthorized"**

Le backend nécessite encore une authentification. Solutions :
1. Créer des endpoints publics (voir section Configuration Backend)
2. Ou désactiver temporairement les guards pour les endpoints queue

### **Le plein écran ne fonctionne pas**

Certains navigateurs bloquent :
1. Utiliser le bouton manuel "Plein écran"
2. Ou utiliser F11
3. Ou lancer le navigateur en mode kiosque

### **WebSocket ne se connecte pas**

Vérifier :
1. Le backend WebSocket est démarré
2. L'URL dans `NEXT_PUBLIC_API_URL`
3. Les CORS du backend autorisent votre domaine

### **Pas de tenant ID**

Si vous voyez `tenantId = ''` :
1. Ajouter `?tenant=xxx` à l'URL
2. Ou définir `NEXT_PUBLIC_DEFAULT_TENANT_ID` dans `.env.local`

---

## 📊 Monitoring

### **Logs à surveiller**

**Console Frontend :**
```
✓ Queue socket connected
✓ Successfully joined queue updates
✓ Queue update received: X tickets
```

**Logs Backend :**
```
[Nest] Client connected to queue namespace
[Nest] Client xxx joined tenant room: tenant-xxx
[Nest] Emitting queue update to room: tenant-xxx
```

---

## 🚀 Déploiement Production

### **Variables d'environnement**

**.env.local** (Frontend) :
```env
NEXT_PUBLIC_API_URL=https://votre-api.com
NEXT_PUBLIC_DEFAULT_TENANT_ID=tenant-principal
```

**.env** (Backend) :
```env
CORS_ORIGIN=https://votre-frontend.com
DEFAULT_TENANT_ID=tenant-principal
```

### **URLs de production**

```
Prise de numéro : https://votre-domaine.com/queue/take-number
Affichage public : https://votre-domaine.com/queue/display
Gestion (auth)  : https://votre-domaine.com/queue/manage
```

---

**Date** : 2025-11-01
**Version** : 2.0.0 (Public Access)
