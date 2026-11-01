# Déploiement Clinoo (sans Docker)

## Mettre à jour la production

```bash
git push origin main          # depuis votre machine
# puis sur le serveur :
/var/www/medical/deploy.sh
```

Si GitHub Actions est configuré (voir plus bas), le `git push` suffit.

| Commande | Effet |
|---|---|
| `./deploy.sh` | git pull + install (si lockfile modifié) + build + redémarrage |
| `./deploy.sh --no-pull` | rebuild + redémarrage du code présent sur le serveur |
| `./deploy.sh --rollback` | retour instantané au build précédent |

Le script compile dans des dossiers temporaires, ne touche au site qu'une fois
les deux builds réussis, puis vérifie `/health` et le frontend. Si le health check
échoue, il revient automatiquement à la version précédente.

## Architecture sur le serveur

```
Apache (clinoo.ptrniger.com, HTTPS)
  ├─ /api/*, /socket.io, /graphql, /health → backend NestJS   127.0.0.1:3001  (PM2: clinoo-backend)
  └─ /*                                    → frontend Next.js 127.0.0.1:3021  (PM2: clinoo-frontend)
```

- PM2 : `ecosystem.config.js` (unique, à la racine)
- Apache : `deploy/clinoo.ptrniger.com.conf` (copie de référence du vhost)
- Config : `medicalBackend/.env` (backend) et `.env.production` (frontend, `NEXT_PUBLIC_API_URL`) — non versionnés
- `.npmrc` : `legacy-peer-deps=true` (requis par les lockfiles actuels)

## Commandes utiles

```bash
pm2 ls                                  # état
pm2 logs clinoo-backend --lines 100     # logs backend (aussi dans logs/)
pm2 restart clinoo-backend              # redémarrer sans rebuild
```

## Base de données

`synchronize` est désactivé en production et il n'y a pas de migrations MySQL.
Quand une entité change (nouvelle colonne…), il faut appliquer le SQL à la main
sur la base de prod **avant** de déployer.

## Déploiement automatique (optionnel)

`.github/workflows/deploy.yml` lance `deploy.sh` en SSH à chaque push sur `main`.
Créer dans GitHub → Settings → Secrets → Actions : `DEPLOY_HOST`, `DEPLOY_USER`,
`DEPLOY_SSH_KEY` (clé privée dont la clé publique est dans `~/.ssh/authorized_keys`
du serveur). Sans ces secrets, le workflow ne fait rien.
