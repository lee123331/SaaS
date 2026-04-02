import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplierById,
  saveSupplierConnection,
  getSupplierConnection,
  createSupplierProductMapping,
  getSupplierProductMappings,
  createOrderDraft,
} from "../controllers/supplierController.js";

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.patch("/:id", updateSupplierById);

router.post("/:id/connection", saveSupplierConnection);
router.get("/:id/connection", getSupplierConnection);

router.post("/:id/mappings", createSupplierProductMapping);
router.get("/:id/mappings", getSupplierProductMappings);

router.post("/:id/order-draft", createOrderDraft);

export default router;