import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createJournal ,updateJournal} from "../controllers/journal.controller.js";

const router = Router();

router.post("/", verifyJWT, createJournal);
router.put("/:id", verifyJWT, updateJournal);
export default router;
