module.exports = {
  apps: [
    {
      name: "api-server",
      script: "server.js",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
      },
    },
    {
      name: "ai-worker",
      script: "worker.js",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
      },
    },
  ],
};