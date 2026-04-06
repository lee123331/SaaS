import express from "express";
import cors from "cors";
import {
  createStore,
  getStores,
  getStoreById,
  oauthCallback,
  syncStore,
  deleteStore,
  handleStoreOptions,
} from "../controllers/storeController.js";

const router = express.Router();

const routeCors = cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
});

router.options("/oauth/callback", routeCors, handleStoreOptions);
router.options("/:id/sync", routeCors, handleStoreOptions);
router.options("/:id", routeCors, handleStoreOptions);
router.options("/", routeCors, handleStoreOptions);

router.post("/", createStore);
router.get("/", getStores);
router.get("/:id", getStoreById);
router.delete("/:id", deleteStore);

// Shopify OAuth callback
router.get("/oauth/callback", oauthCallback);
router.post("/oauth/callback", oauthCallback);

// Store sync
router.post("/:id/sync", syncStore);

export default router;