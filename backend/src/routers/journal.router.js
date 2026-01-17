import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createJournal } from "../controllers/journal.controller.js";

const router = Router();

router.post("/", verifyJWT, createJournal);

export default router;
