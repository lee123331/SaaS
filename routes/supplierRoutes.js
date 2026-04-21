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
  getRecommendedSuppliers,
  confirmSupplierMapping,
  getConfirmedSupplierMappingByVariant,
  createOrderDraft,
} from "../controllers/supplierController.js";

const router = express.Router();

router.get("/recommend", getRecommendedSuppliers);
router.post("/mappings/confirm", confirmSupplierMapping);
router.get("/mappings/by-variant/:variantId", getConfirmedSupplierMappingByVariant);

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