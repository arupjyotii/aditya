module.exports = {
  apps: [{
    name: 'aditya-hospital',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      DATA_DIRECTORY: '/var/www/aditya-hospital/data',
      JWT_SECRET: 'b7e2f8c1-4d3a-4e9b-9c2a-7f6e5d4c3b2a-2025-!@#S3cure$%^JwT&*()-Key_2025'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      DATA_DIRECTORY: '/var/www/aditya-hospital/data'
    }
  }]
};