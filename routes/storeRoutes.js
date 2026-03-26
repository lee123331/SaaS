import express from "express";
import {
  createStore,
  getStores,
  saveOAuthStore,
} from "../controllers/storeController.js";
import { syncStore } from "../controllers/syncController.js";

const router = express.Router();

router.post("/", createStore);
router.get("/", getStores);
router.post("/:id/sync", syncStore);
router.post("/oauth/callback", saveOAuthStore);

export default router;

