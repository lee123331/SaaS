// services/supplierService.js
import axios from "axios";

const SupplierService = {
  parseJsonField(field) {
    if (!field) return null;
    if (typeof field === "object") return field;

    try {
      return JSON.parse(field);
    } catch (error) {
      return null;
    }
  },

  buildRequestUrl(supplier) {
    const baseUrl = (supplier.apiBaseUrl || "").replace(/\/$/, "");
    const endpoint = (supplier.orderEndpoint || "").replace(/^\//, "");
    return `${baseUrl}/${endpoint}`;
  },

  buildHeaders(supplier) {
    const headers = {
      "Content-Type": "application/json",
    };

    const defaultHeaders = this.parseJsonField(supplier.defaultHeaders);
    if (defaultHeaders && typeof defaultHeaders === "object") {
      Object.assign(headers, defaultHeaders);
    }

    switch (supplier.authType) {
      case "apiKey":
        headers["x-api-key"] = supplier.apiKey;
        break;

      case "bearer":
        headers["Authorization"] = `Bearer ${supplier.apiKey}`;
        break;

      case "basic": {
        const encoded = Buffer.from(
          `${supplier.apiKey}:${supplier.apiSecret || ""}`
        ).toString("base64");
        headers["Authorization"] = `Basic ${encoded}`;
        break;
      }

      case "none":
      default:
        break;
    }

    return headers;
  },

  buildOrderPayload({ order, supplier }) {
    const template = this.parseJsonField(supplier.payloadTemplate);

    if (template) {
      const raw = JSON.stringify(template)
        .replace(/\{\{productId\}\}/g, String(order.productId || ""))
        .replace(/\{\{productName\}\}/g, String(order.productName || ""))
        .replace(/\{\{supplierProductCode\}\}/g, String(order.supplierProductCode || ""))
        .replace(/\{\{approvedQty\}\}/g, String(order.approvedQty || order.recommendedQty || 0))
        .replace(/\{\{recommendedQty\}\}/g, String(order.recommendedQty || 0))
        .replace(/\{\{note\}\}/g, String(order.note || ""));

      try {
        return JSON.parse(raw);
      } catch (error) {
        throw new Error("공급처 payloadTemplate JSON 형식이 올바르지 않습니다.");
      }
    }

    return {
      productId: order.productId,
      productName: order.productName,
      supplierProductCode: order.supplierProductCode,
      quantity: order.approvedQty || order.recommendedQty,
      note: order.note || "자동 발주 시스템 생성 주문",
    };
  },

  normalizeSupplierResponse(response) {
    const data = response?.data || {};

    return {
      success: true,
      responseStatus: response.status,
      responseBody: data,
      supplierOrderId: data.orderId || data.supplierOrderId || data.id || null,
      externalStatus: data.status || "ordered",
    };
  },

  async sendOrderToSupplier({ supplier, order }) {
    if (!supplier) {
      throw new Error("공급처 정보가 없습니다.");
    }

    if (supplier.status !== "active") {
      throw new Error("비활성화된 공급처입니다.");
    }

    const requestUrl = this.buildRequestUrl(supplier);
    const headers = this.buildHeaders(supplier);
    const payload = this.buildOrderPayload({ order, supplier });

    try {
      const response = await axios.post(requestUrl, payload, {
        headers,
        timeout: 10000,
      });

      const normalized = this.normalizeSupplierResponse(response);

      return {
        success: true,
        requestUrl,
        requestHeaders: headers,
        requestBody: payload,
        responseStatus: normalized.responseStatus,
        responseBody: normalized.responseBody,
        supplierOrderId: normalized.supplierOrderId,
        externalStatus: normalized.externalStatus,
      };
    } catch (error) {
      return {
        success: false,
        requestUrl,
        requestHeaders: headers,
        requestBody: payload,
        responseStatus: error.response?.status || null,
        responseBody: error.response?.data || null,
        errorMessage: error.message,
      };
    }
  },
};

export default SupplierService;