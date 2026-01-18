import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
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

app.use('/api/v1/users', userRouter)
app.use('/api/v1/journals', journalRouter)
app.use('/api/v1/analytics',analyticsRouter)
export { app }