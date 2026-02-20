module.exports = {
  apps: [{
    name: 'medical-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3011',
    cwd: '/var/www/medical',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3011
    },
    error_file: '/var/www/medical/logs/frontend-error.log',
    out_file: '/var/www/medical/logs/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
