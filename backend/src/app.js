import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan";
import helmet from "helmet";
const app=express()
app.use(helmet());
app.use(morgan("combined"))
app.use(cors({
    origin:process.env.CORS_ORIGIN.split(","),
    credentials:true
}))
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
import userRouter from "./routers/user.routes.js"
import journalRouter from "./routers/journal.router.js"
import analyticsRouter from "./routers/analytics.router.js"
import { ApiError } from "./utils/ApiError.js"

app.use('/api/v1/users', userRouter)
app.use('/api/v1/journals', journalRouter)
app.use('/api/v1/analytics',analyticsRouter)

// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.error
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

export { app }