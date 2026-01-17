import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createJournal,
  updateJournal,
  getAllJournals,
  getJournalById,
  deleteJournal
} from "../controllers/journal.controller.js";

const router = Router();

router.post("/", verifyJWT, createJournal);
router.put("/:id", verifyJWT, updateJournal);
router.get("/", verifyJWT, getAllJournals);
router.get("/:id", verifyJWT, getJournalById);
router.delete("/:id", verifyJWT, deleteJournal);
export default router;
