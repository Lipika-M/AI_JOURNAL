import 'dotenv/config';
export const apps = [
    {
        name: "ai-journal", // Your API server
        script: "src/index.js", // entry point for your API
        watch: false,
        env_production: {
            NODE_ENV: "production",
            PORT: process.env.PORT,
            MONGODB_URI: process.env.MONGODB_URI,
            REDIS_URL: process.env.REDIS_URL,
            CORS_ORIGIN: process.env.CORS_ORIGIN,
            ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
            ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
            REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
            REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
            GROQ_API_KEY: process.env.GROQ_API_KEY,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            AWS_REGION: process.env.AWS_REGION,
            SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
        },
    },
    // Temporary deployment mode: disable SQS worker process.
    // Keep this config for quick re-enable after AWS/SQS is available.
    // {
    //     name: "ai-worker", // Your background AI worker
    //     script: "workers/aiWorker.js",
    //     watch: false,
    //     env_production: {
    //         NODE_ENV: "production",
    //         SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
    //     },
    // },
];