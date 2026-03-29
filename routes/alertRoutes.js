import express from "express";
import {
  getAlerts,
  generateAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);
router.post("/generate", generateAlerts);

export default router;