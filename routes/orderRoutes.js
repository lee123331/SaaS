// routes/orderRoutes.js
import express from "express";
import OrderController from "../controllers/orderController.js";

const router = express.Router();

router.post("/generate", OrderController.generateOrders);
router.get("/", OrderController.getOrders);
router.patch("/:id/approve", OrderController.approveOrder);
router.post("/:id/send", OrderController.sendOrderToSupplier);

export default router;