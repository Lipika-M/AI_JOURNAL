import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getMoodTrends,
  getSentimentDistribution,
  getTagsDistribution,
  getAverageMoodByTag
} from "../controllers/analytics.controller.js";

const router = Router();

router.route("/mood-trends").get(verifyJWT, getMoodTrends);
router.route("/sentiment-distribution").get(verifyJWT, getSentimentDistribution);
router.route("/tags-distribution").get(verifyJWT, getTagsDistribution);
router.route("/average-mood-by-tag").get(verifyJWT, getAverageMoodByTag);
export default router;
