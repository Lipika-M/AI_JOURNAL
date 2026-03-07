import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createJournal,
  updateJournal,
  getAllJournals,
  getJournalById,
  deleteJournal
} from "../controllers/journal.controller.js";

const router = Router();

router.post("/", verifyJWT, upload.array("images", 2), createJournal);
router.put("/:id", verifyJWT, upload.array("images", 2), updateJournal);
router.get("/", verifyJWT, getAllJournals);
router.get("/:id", verifyJWT, getJournalById);
router.delete("/:id", verifyJWT, deleteJournal);
export default router;
