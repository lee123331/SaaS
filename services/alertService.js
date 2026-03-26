<<<<<<< HEAD
import * as productModel from "../models/productModel.js";

export const getAlerts = async () => {
  const products = await productModel.getAllProducts();

  return products
    .filter((product) => product.stock <= 10)
    .map((product) => ({
      productId: product.id,
      name: product.name,
      stock: product.stock,
      avgDailySales: 0,
      expectedOutOfStockDays: 0,
      recommendedOrderQty: 0,
      level: product.stock <= 3 ? "critical" : "warning",
      message:
        product.stock <= 3
          ? "재고가 매우 적습니다. 즉시 발주 검토 필요"
          : "재고가 부족합니다. 발주 검토 필요",
    }));
=======
import {
  avgDailySales,
  expectedOutOfStockDays,
  recommendedOrderQty,
} from "../utils/calc.js";
import { getRawProducts } from "./productService.js";

const getAlertLevel = (days) => {
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "info";
};

export const getAlerts = async () => {
  const products = await getRawProducts();

  return products
    .map((product) => {
      const avg = avgDailySales(product.salesLast7Days);
      const days = expectedOutOfStockDays(product.stock, avg);
      const recommendedQty = recommendedOrderQty(
        avg,
        product.safetyStock,
        product.stock
      );

      return {
        productId: product.id,
        name: product.name,
        stock: product.stock,
        avgDailySales: avg,
        expectedOutOfStockDays: days,
        recommendedOrderQty: recommendedQty,
        level: getAlertLevel(days),
        message:
          days <= 7
            ? `${days}일 내 품절 예상. 발주 권장`
            : `현재는 안정 재고 상태입니다.`,
      };
    })
    .filter((alert) => alert.level !== "info");
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361
};