module.exports = {
  apps: [
    {
      name: 'preprueba-web',
      script: 'pm2-launcher.js',
      args: 'web ./apps/web',
    },
    {
      name: 'preprueba-api',
      script: 'pm2-launcher.js',
      args: 'api ./apps/api',
      env: {
        PORT: 3001,
      },
    },
  ],
};
