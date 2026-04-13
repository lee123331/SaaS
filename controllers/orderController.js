// controllers/orderController.js
import OrderService from "../services/orderService.js";

const OrderController = {
  async generateOrders(req, res) {
    try {
      const result = await OrderService.generateOrdersFromLowStock();

      return res.status(201).json({
        success: true,
        message: "자동 발주 추천 생성 완료",
        createdOrders: result.createdOrders,
        skippedProducts: result.skippedProducts,
      });
    } catch (error) {
      console.error("[generateOrders error]", error);
      return res.status(500).json({
        success: false,
        message: error.message || "자동 발주 추천 생성 중 오류가 발생했습니다.",
      });
    }
  },

  async getOrders(req, res) {
    try {
      const orders = await OrderService.getOrders();

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error("[getOrders error]", error);
      return res.status(500).json({
        success: false,
        message: error.message || "발주 목록 조회 중 오류가 발생했습니다.",
      });
    }
  },

  async approveOrder(req, res) {
    try {
      const { id } = req.params;
      const { approvedQty } = req.body;

      const result = await OrderService.approveOrder(id, approvedQty);

      return res.status(200).json({
        success: true,
        message: "발주 승인 완료",
        order: result,
      });
    } catch (error) {
      console.error("[approveOrder error]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "발주 승인 중 오류가 발생했습니다.",
      });
    }
  },

  async createApprovedOrder(req, res) {
    console.log("[createApprovedOrder] body:", req.body);
  try {
    const productId = Number(
      req.body.product_id ??
      req.body.productId ??
      req.body.id
    );

    const quantity = Number(
      req.body.quantity ??
      req.body.approvedQty ??
      req.body.recommendedOrderQty ??
      req.body.qty
    );

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "유효한 product_id가 필요합니다.",
        received: req.body,
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "유효한 quantity가 필요합니다.",
        received: req.body,
      });
    }

    const result = await OrderService.createApprovedOrder({
      productId,
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: "발주 생성 완료",
      order: result,
    });
  } catch (error) {
    console.error("[createApprovedOrder error]", error);
    return res.status(400).json({
      success: false,
      message: error.message || "발주 생성 중 오류가 발생했습니다.",
    });
  }
},

  async sendOrderToSupplier(req, res) {
    try {
      const { id } = req.params;

      const result = await OrderService.sendApprovedOrderToSupplier(id);

      return res.status(200).json({
        success: true,
        message: "공급처 API 발주 전송 완료",
        order: result,
      });
    } catch (error) {
      console.error("[sendOrderToSupplier error]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "공급처 API 발주 전송 중 오류가 발생했습니다.",
      });
    }
  },
};

export default OrderController;