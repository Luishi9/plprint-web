module.exports = {
  apps: [
    {
      name: 'plprint-api',
      script: './dist/server.js',
      cwd: '/var/www/plprint/plprint-api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/plprint-api.err.log',
      out_file: '/var/log/plprint-api.out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
