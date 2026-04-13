// services/orderService.js
import db from "../config/db.js";
import OrderModel from "../models/orderModel.js";
import SupplierModel from "../models/supplierModel.js";
import ReorderService from "./reorderService.js";
import SupplierService from "./supplierService.js";

const OrderService = {
  async generateOrdersFromLowStock() {
    const [products] = await db.query(`
      SELECT
        id,
        title AS name,
        stock,
        minStock,
        targetStock,
        supplierId,
        supplierProductCode,
        leadTimeDays
      FROM products
      ORDER BY id DESC
    `);

    const createdOrders = [];
    const skippedProducts = [];

    for (const product of products) {
      const shouldCreate = ReorderService.shouldCreateOrder(product);

      if (!shouldCreate) {
        skippedProducts.push({
          productId: product.id,
          productName: product.name,
          reason: "재고가 최소 안전재고 이상입니다.",
        });
        continue;
      }

      const existingOpenOrder = await OrderModel.findOpenOrderByProductId(product.id);

      if (existingOpenOrder) {
        skippedProducts.push({
          productId: product.id,
          productName: product.name,
          reason: "이미 pending 또는 approved 상태의 발주가 존재합니다.",
        });
        continue;
      }

      const recommendedQty = ReorderService.calculateRecommendedOrder(product);

      if (recommendedQty <= 0) {
        skippedProducts.push({
          productId: product.id,
          productName: product.name,
          reason: "추천 발주 수량이 0입니다.",
        });
        continue;
      }

      const result = await OrderModel.createOrder({
        productId: product.id,
        supplierId: product.supplierId || null,
        recommendedQty,
        status: "pending",
        note: "자동 재고 분석 기반 발주 추천",
      });

      createdOrders.push({
        orderId: result.insertId,
        productId: product.id,
        productName: product.name,
        stock: product.stock,
        recommendedQty,
        status: "pending",
      });
    }

    return {
      createdOrders,
      skippedProducts,
    };
  },

  async getOrders() {
    return await OrderModel.getAllOrders();
  },

  async approveOrder(orderId, approvedQty) {
    const order = await OrderModel.getOrderById(orderId);

    if (!order) {
      throw new Error("발주를 찾을 수 없습니다.");
    }

    if (order.status !== "pending") {
      throw new Error("pending 상태의 발주만 승인할 수 있습니다.");
    }

    const finalApprovedQty = Number(approvedQty || order.recommendedQty);

    if (!Number.isInteger(finalApprovedQty) || finalApprovedQty <= 0) {
      throw new Error("approvedQty는 1 이상의 정수여야 합니다.");
    }

    await OrderModel.updateOrderStatus(orderId, "approved", finalApprovedQty, null);

    return {
      orderId: Number(orderId),
      status: "approved",
      approvedQty: finalApprovedQty,
    };
  },

  async createApprovedOrder({ productId, quantity }) {
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error("유효한 product_id가 필요합니다.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("quantity는 1 이상의 정수여야 합니다.");
    }

    const [rows] = await db.query(
  `
  SELECT
    id,
    title,
    stock
  FROM products
  WHERE id = ?
  LIMIT 1
  `,
  [productId]
);

    const product = rows[0];

    if (!product) {
      throw new Error("상품을 찾을 수 없습니다.");
    }

    const result = await OrderModel.createOrder({
      productId: product.id,
      supplierId: null,
      recommendedQty: quantity,
      status: "approved",
      note: "프론트 수동 발주 생성",
    });

    return {
      orderId: result.insertId,
      productId: product.id,
      productName: product.title,
      quantity,
      status: "approved",
    };
  },

  async sendApprovedOrderToSupplier(orderId) {
    const order = await OrderModel.getOrderById(orderId);

    if (!order) {
      throw new Error("발주를 찾을 수 없습니다.");
    }

    if (order.status !== "approved") {
      throw new Error("approved 상태의 발주만 공급처로 전송할 수 있습니다.");
    }

    if (!order.supplierId) {
      throw new Error("해당 발주에 연결된 공급처가 없습니다.");
    }

    const supplier = await SupplierModel.getSupplierById(order.supplierId);

    if (!supplier) {
      throw new Error("공급처 정보를 찾을 수 없습니다.");
    }

    const sendResult = await SupplierService.sendOrderToSupplier({
      supplier,
      order,
    });

    await OrderModel.createSupplierOrderLog({
      purchaseOrderId: order.id,
      supplierId: supplier.id,
      requestUrl: sendResult.requestUrl,
      requestMethod: "POST",
      requestHeaders: sendResult.requestHeaders,
      requestBody: sendResult.requestBody,
      responseStatus: sendResult.responseStatus,
      responseBody: sendResult.responseBody,
      success: sendResult.success,
      errorMessage: sendResult.errorMessage || null,
    });

    if (!sendResult.success) {
      await OrderModel.markAsFailed(
        order.id,
        sendResult.requestBody,
        sendResult.responseBody,
        "failed"
      );

      throw new Error(
        `공급처 API 발주 전송 실패: ${sendResult.errorMessage || "알 수 없는 오류"}`
      );
    }

    const orderedQty = Number(order.approvedQty || order.recommendedQty);

    await OrderModel.markAsOrdered({
      orderId: order.id,
      orderedQty,
      supplierOrderId: sendResult.supplierOrderId,
      externalStatus: sendResult.externalStatus,
      requestedPayload: sendResult.requestBody,
      responsePayload: sendResult.responseBody,
    });

    return {
      orderId: order.id,
      status: "ordered",
      orderedQty,
      supplierOrderId: sendResult.supplierOrderId,
      externalStatus: sendResult.externalStatus,
    };
  },
};

export default OrderService;