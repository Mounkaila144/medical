module.exports = {
  apps: [
    {
      name: 'medical-backend-dev',
      script: 'pnpm',
      args: 'run start:dev',
      cwd: '/var/www/medicalBackend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'dist', 'logs', '.git', 'uploads'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/dev-err.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'medical-backend-prod',
      script: 'dist/main.js',
      cwd: '/var/www/medicalBackend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/prod-err.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Configuration pour la production
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Health check
      health_check_grace_period: 3000
    }
  ],

  // Configuration pour le déploiement (optionnel)
  deploy: {
    production: {
      user: 'medical',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:username/medicalBackend.git',
      path: '/var/www/medicalBackend',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
