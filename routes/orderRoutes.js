import express from "express";
import OrderController from "../controllers/orderController.js";

const router = express.Router();

router.post("/generate", OrderController.generateOrders);
router.get("/", OrderController.getOrders);

// 기존 방식
router.patch("/:id/approve", OrderController.approveOrder);

// 프론트 실제 호출 방식
router.post("/approve", OrderController.createApprovedOrder);

router.post("/:id/send", OrderController.sendOrderToSupplier);

export default router;