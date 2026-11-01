// Configuration PM2 unique pour Clinoo (backend + frontend).
// Utilisée par ./deploy.sh — démarrage manuel : pm2 startOrReload ecosystem.config.js
const ROOT = __dirname;

module.exports = {
  apps: [
    {
      name: 'clinoo-backend',
      script: 'dist/src/main.js',
      cwd: `${ROOT}/medicalBackend`,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '700M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: `${ROOT}/logs/backend-error.log`,
      out_file: `${ROOT}/logs/backend-out.log`,
      time: true,
      merge_logs: true,
    },
    {
      name: 'clinoo-frontend',
      script: 'node_modules/next/dist/bin/next',
      // 3011 est déjà utilisé par une autre application du serveur (pdm-front)
      args: 'start -p 3021',
      cwd: ROOT,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3021,
      },
      error_file: `${ROOT}/logs/frontend-error.log`,
      out_file: `${ROOT}/logs/frontend-out.log`,
      time: true,
      merge_logs: true,
    },
  ],
};
