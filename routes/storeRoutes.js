import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  oauthCallback,
  syncStore,
} from "../controllers/storeController.js";

const router = express.Router();

router.post("/", createStore);
router.get("/", getStores);
router.get("/:id", getStoreById);

router.post("/oauth/callback", oauthCallback);
router.post("/:id/sync", syncStore);

export default router;