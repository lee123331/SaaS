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
};