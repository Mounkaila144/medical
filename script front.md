# Script de Déploiement Automatique Next.js avec PM2

## Installation

Le script `deploy-nextjs` a été installé globalement sur ce serveur.

## Utilisation

```bash
deploy-nextjs /chemin/du/projet PORT
```

### Paramètres

- **Chemin du projet** : Chemin absolu vers votre projet Next.js (doit contenir un `package.json`)
- **PORT** : Port sur lequel l'application sera accessible (ex: 3000, 3001, 3002, etc.)

### Exemples

```bash
# Déployer le projet imob sur le port 3000
deploy-nextjs /var/www/imob 3000

# Déployer un autre projet sur le port 3001
deploy-nextjs /var/www/mon-autre-projet 3001

# Déployer un troisième projet sur le port 4000
deploy-nextjs /var/www/projet-test 4000
```

## Ce que fait le script

1. ✅ Crée le dossier `logs/` dans le projet
2. ✅ Génère automatiquement le fichier `ecosystem.config.js` avec la configuration PM2 optimisée
3. ✅ Crée un fichier `.env.production` si il n'existe pas
4. ✅ Nettoie les anciennes installations (node_modules, .next)
5. ✅ Exécute `npm install` pour installer les dépendances
6. ✅ Exécute `npm run build` pour builder le projet
7. ✅ Démarre l'application avec PM2 sur le port choisi
8. ✅ Sauvegarde la configuration PM2 pour le redémarrage automatique

## Configuration PM2 générée

Chaque projet déployé aura :
- **Nom PM2** : `nom-du-dossier-pm2` (ex: `imob-pm2`)
- **Mode** : fork (1 seule instance pour économiser la RAM)
- **Limite RAM** : 500 MB (redémarrage automatique si dépassé)
- **Limite Node.js** : 400 MB
- **Logs** : Stockés dans `logs/pm2-error.log` et `logs/pm2-out.log`

## Commandes PM2 utiles

```bash
# Voir tous les processus
pm2 status

# Voir les logs d'une application
pm2 logs nom-du-projet-pm2

# Redémarrer une application
pm2 restart nom-du-projet-pm2

# Arrêter une application
pm2 stop nom-du-projet-pm2

# Supprimer une application de PM2
pm2 delete nom-du-projet-pm2

# Monitoring en temps réel
pm2 monit
```

## Gestion de plusieurs projets

Vous pouvez déployer plusieurs projets Next.js sur le même serveur en utilisant des ports différents :

```bash
deploy-nextjs /var/www/projet1 3000
deploy-nextjs /var/www/projet2 3001
deploy-nextjs /var/www/projet3 3002
```

Ensuite, configurez votre reverse proxy (Nginx/Apache) pour router les domaines vers les bons ports.

## Redéploiement

Si vous exécutez `deploy-nextjs` sur un projet déjà déployé, le script vous demandera si vous voulez redémarrer l'application existante.

## Structure des fichiers générés

```
/votre/projet/
├── ecosystem.config.js    # Configuration PM2 (généré automatiquement)
├── .env.production        # Variables d'environnement (généré si absent)
├── logs/                  # Dossier des logs
│   ├── pm2-error.log
│   └── pm2-out.log
├── node_modules/
├── .next/
└── package.json
```

## Optimisations RAM

Chaque projet est configuré pour :
- Consommer ~80-150 MB en moyenne
- Redémarrer automatiquement si > 500 MB
- Limiter Node.js à 400 MB max

## Dépannage

### Le script ne fonctionne pas
```bash
# Vérifier que le script existe
which deploy-nextjs

# Vérifier qu'il est exécutable
ls -l /usr/local/bin/deploy-nextjs
```

### Port déjà utilisé
Si le port est déjà utilisé, choisissez un autre port ou arrêtez l'application qui l'utilise :
```bash
# Voir quel processus utilise le port 3000
lsof -i :3000

# Arrêter l'application PM2 sur ce port
pm2 stop nom-du-projet-pm2
```

### Erreur de build
Vérifiez les logs dans `logs/pm2-error.log` ou exécutez manuellement :
```bash
cd /chemin/du/projet
npm run build
```

## Support

Pour toute question, vérifiez :
- Les logs PM2 : `pm2 logs nom-du-projet-pm2`
- Les logs du projet : `/chemin/du/projet/logs/`
- Le statut PM2 : `pm2 status`