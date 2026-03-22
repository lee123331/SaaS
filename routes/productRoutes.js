import express from "express";
import {
  getProducts,
  getProductDetail,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductDetail);

export default router;