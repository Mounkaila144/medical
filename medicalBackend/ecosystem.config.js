module.exports = {
  apps: [
    {
      name: 'medical-backend-prod',
      script: 'dist/src/main.js',
      cwd: '/var/www/medical/medicalBackend',
      instances: 2,          // ou 'max'
      exec_mode: 'cluster',  // OK pour NestJS
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/prod-err.log',
      out_file: './logs/prod-out.log',
      time: true
    }
  ]
};
