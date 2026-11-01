#!/usr/bin/env bash
# =============================================================================
#  Clinoo — script de déploiement unique (sans Docker)
#
#  ./deploy.sh              git pull + install + build + redémarrage
#  ./deploy.sh --no-pull    build + redémarrage du code actuel (sans git pull)
#  ./deploy.sh --rollback   revient instantanément au build précédent
#
#  Principe : on compile dans des dossiers temporaires. Le site en ligne n'est
#  touché qu'une fois les DEUX builds réussis. Si le health check échoue après
#  redémarrage, retour automatique à la version précédente.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/medicalBackend"
TMP="$ROOT/.deploy-tmp"
BACKEND_URL="http://127.0.0.1:3001/health"
FRONTEND_URL="http://127.0.0.1:3021/"
BRANCH="main"

step() { echo -e "\n\033[1;34m▶ $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔ $*\033[0m"; }
fail() { echo -e "\033[1;31m✘ $*\033[0m" >&2; exit 1; }

wait_for() { # wait_for <url> <nom>
  for _ in $(seq 1 30); do
    curl -fs -o /dev/null "$1" && { ok "$2 répond"; return 0; }
    sleep 2
  done
  echo -e "\033[1;31m✘ $2 ne répond pas ($1)\033[0m" >&2
  return 1
}

restart_and_check() {
  mkdir -p "$ROOT/logs"
  pm2 startOrReload "$ROOT/ecosystem.config.js" --update-env
  pm2 save >/dev/null
  wait_for "$BACKEND_URL" "Backend" && wait_for "$FRONTEND_URL" "Frontend"
}

swap_back() { # remet les builds *.old en place
  [[ -d "$BACKEND/dist.old" && -d "$ROOT/.next.old" ]] || fail "Aucun build précédent disponible."
  rm -rf "$BACKEND/dist.failed" "$ROOT/.next.failed"
  mv "$BACKEND/dist" "$BACKEND/dist.failed"; mv "$BACKEND/dist.old" "$BACKEND/dist"
  mv "$ROOT/.next" "$ROOT/.next.failed";     mv "$ROOT/.next.old" "$ROOT/.next"
}

# ---------------------------------------------------------------- rollback ---
if [[ "${1:-}" == "--rollback" ]]; then
  step "Retour au build précédent"
  swap_back
  restart_and_check || fail "Le build précédent ne répond pas non plus — voir: pm2 logs"
  ok "Rollback terminé. (Le code git n'a pas bougé : corrigez puis relancez ./deploy.sh)"
  exit 0
fi

cd "$ROOT"
command -v pm2 >/dev/null || fail "pm2 introuvable (npm i -g pm2)"

# --------------------------------------------------------------- git pull ---
PREV="$(git rev-parse HEAD)"
if [[ "${1:-}" != "--no-pull" ]]; then
  step "Récupération du code ($BRANCH)"
  # GraphQL régénère ce fichier au démarrage du backend : on ignore cette modif locale
  git checkout -- medicalBackend/src/schema.gql 2>/dev/null || true
  git diff --quiet && git diff --cached --quiet \
    || fail "Modifications locales non commitées sur le serveur. Commitez-les ou lancez ./deploy.sh --no-pull"
  git pull --ff-only origin "$BRANCH"
fi
CHANGED="$(git diff --name-only "$PREV" HEAD)"
git log --oneline "$PREV..HEAD" | sed 's/^/   /' || true

# ------------------------------------------------------------ dépendances ---
needs_install() { # needs_install <dossier> <préfixe-git>
  [[ ! -d "$1/node_modules" ]] || grep -qE "^${2}package(-lock)?\.json$" <<<"$CHANGED"
}
if needs_install "$ROOT" ""; then
  step "Installation des dépendances frontend"; npm ci --no-audit --no-fund
fi
if needs_install "$BACKEND" "medicalBackend/"; then
  step "Installation des dépendances backend"; (cd "$BACKEND" && npm ci --no-audit --no-fund)
fi

# ------------------------------------------------------------------ build ---
rm -rf "$TMP"; mkdir -p "$TMP"

step "Build backend (NestJS)"
(cd "$BACKEND" && npx tsc -p tsconfig.build.json --outDir "$TMP/backend-dist")
[[ -f "$TMP/backend-dist/src/main.js" ]] || fail "Build backend incomplet (main.js absent)"
ok "Backend compilé"

step "Build frontend (Next.js)"
rm -rf "$ROOT/.next-build"
NEXT_DIST_DIR=.next-build NODE_OPTIONS=--max-old-space-size=2048 npm run build
ok "Frontend compilé"

# -------------------------------------------------- bascule + redémarrage ---
step "Mise en ligne"
rm -rf "$BACKEND/dist.old" "$ROOT/.next.old"
[[ -d "$BACKEND/dist" ]] && mv "$BACKEND/dist" "$BACKEND/dist.old"
mv "$TMP/backend-dist" "$BACKEND/dist"
[[ -d "$ROOT/.next" ]] && mv "$ROOT/.next" "$ROOT/.next.old"
mv "$ROOT/.next-build" "$ROOT/.next"
rm -rf "$TMP"

if restart_and_check; then
  ok "Déploiement terminé : $(git log -1 --format='%h %s')"
else
  echo -e "\033[1;33m⚠ Échec du health check, retour automatique à la version précédente…\033[0m"
  swap_back
  restart_and_check || true
  fail "Déploiement annulé. Logs : pm2 logs clinoo-backend --lines 50"
fi
