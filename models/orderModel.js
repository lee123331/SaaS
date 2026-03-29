// models/orderModel.js
import db from "../config/db.js";

const OrderModel = {
  async createOrder({
    productId,
    supplierId,
    recommendedQty,
    approvedQty = null,
    orderedQty = null,
    status = "pending",
    note = null,
    requestedPayload = null,
    responsePayload = null,
    supplierOrderId = null,
    externalStatus = null,
    orderDate = null,
  }) {
    const [result] = await db.query(
      `
      INSERT INTO purchase_orders (
        productId,
        supplierId,
        recommendedQty,
        approvedQty,
        orderedQty,
        status,
        note,
        requestedPayload,
        responsePayload,
        supplierOrderId,
        externalStatus,
        orderDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        supplierId,
        recommendedQty,
        approvedQty,
        orderedQty,
        status,
        note,
        requestedPayload ? JSON.stringify(requestedPayload) : null,
        responsePayload ? JSON.stringify(responsePayload) : null,
        supplierOrderId,
        externalStatus,
        orderDate,
      ]
    );

    return result;
  },

async getAllOrders() {
  const [rows] = await db.query(`
    SELECT
      po.*,
      p.title AS productName,
      p.stock,
      p.minStock,
      p.targetStock,
      p.supplierProductCode,
      s.name AS supplierName
    FROM purchase_orders po
    JOIN products p ON po.productId = p.id
    LEFT JOIN suppliers s ON po.supplierId = s.id
    ORDER BY po.createdAt DESC
  `);

  return rows;
},

  async getOrderById(orderId) {
    const [rows] = await db.query(
      `
      SELECT
        po.*,
        p.title AS productName,
        p.stock,
        p.minStock,
        p.targetStock,
        p.supplierProductCode,
        p.leadTimeDays,
        s.name AS supplierName,
        s.apiBaseUrl,
        s.orderEndpoint,
        s.authType,
        s.apiKey,
        s.apiSecret,
        s.defaultHeaders,
        s.payloadTemplate,
        s.status AS supplierStatus
      FROM purchase_orders po
      JOIN products p ON po.productId = p.id
      LEFT JOIN suppliers s ON po.supplierId = s.id
      WHERE po.id = ?
      `,
      [orderId]
    );

    return rows[0];
  },

  async findOpenOrderByProductId(productId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM purchase_orders
      WHERE productId = ?
        AND status IN ('pending', 'approved')
      ORDER BY createdAt DESC
      LIMIT 1
      `,
      [productId]
    );

    return rows[0];
  },

  async updateOrderStatus(orderId, status, approvedQty = null, orderedQty = null) {
    const [result] = await db.query(
      `
      UPDATE purchase_orders
      SET
        status = ?,
        approvedQty = COALESCE(?, approvedQty),
        orderedQty = COALESCE(?, orderedQty)
      WHERE id = ?
      `,
      [status, approvedQty, orderedQty, orderId]
    );

    return result;
  },

  async markAsOrdered({
    orderId,
    orderedQty,
    supplierOrderId,
    externalStatus,
    requestedPayload,
    responsePayload,
  }) {
    const [result] = await db.query(
      `
      UPDATE purchase_orders
      SET
        status = 'ordered',
        orderedQty = ?,
        supplierOrderId = ?,
        externalStatus = ?,
        requestedPayload = ?,
        responsePayload = ?,
        orderDate = NOW()
      WHERE id = ?
      `,
      [
        orderedQty,
        supplierOrderId,
        externalStatus,
        requestedPayload ? JSON.stringify(requestedPayload) : null,
        responsePayload ? JSON.stringify(responsePayload) : null,
        orderId,
      ]
    );

    return result;
  },

  async markAsFailed(orderId, requestedPayload = null, responsePayload = null, externalStatus = null) {
    const [result] = await db.query(
      `
      UPDATE purchase_orders
      SET
        status = 'failed',
        requestedPayload = ?,
        responsePayload = ?,
        externalStatus = ?
      WHERE id = ?
      `,
      [
        requestedPayload ? JSON.stringify(requestedPayload) : null,
        responsePayload ? JSON.stringify(responsePayload) : null,
        externalStatus,
        orderId,
      ]
    );

    return result;
  },

  async createSupplierOrderLog({
    purchaseOrderId,
    supplierId,
    requestUrl,
    requestMethod = "POST",
    requestHeaders = null,
    requestBody = null,
    responseStatus = null,
    responseBody = null,
    success = false,
    errorMessage = null,
  }) {
    const [result] = await db.query(
      `
      INSERT INTO supplier_order_logs (
        purchaseOrderId,
        supplierId,
        requestUrl,
        requestMethod,
        requestHeaders,
        requestBody,
        responseStatus,
        responseBody,
        success,
        errorMessage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        purchaseOrderId,
        supplierId,
        requestUrl,
        requestMethod,
        requestHeaders ? JSON.stringify(requestHeaders) : null,
        requestBody ? JSON.stringify(requestBody) : null,
        responseStatus,
        responseBody ? JSON.stringify(responseBody) : null,
        success,
        errorMessage,
      ]
    );

    return result;
  },
};

export default OrderModel;