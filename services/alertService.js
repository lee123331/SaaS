import * as productModel from "../models/productModel.js";

const DEFAULT_SAFETY_STOCK = 10;
const DEFAULT_LEAD_TIME_DAYS = 3;

export const getAlerts = async () => {
  const products = await productModel.getAllProducts();

  const alerts = products
    .map((product) => {
      const stock = Number(product.stock || 0);
      const avgDailySales = 0;
      const safetyStock = DEFAULT_SAFETY_STOCK;
      const leadTimeDays = DEFAULT_LEAD_TIME_DAYS;
      const expectedOutOfStockDays = 0;

      const isBelowSafetyStock = stock <= safetyStock;
      const isBelowLeadTime =
        expectedOutOfStockDays <= leadTimeDays && avgDailySales > 0;

      if (!isBelowSafetyStock && !isBelowLeadTime) {
        return null;
      }

      const recommendedOrderQty = Math.max(safetyStock - stock, 0);

      return {
        productId: String(product.id),
        name: product.title,
        stock,
        avgDailySales,
        level: stock <= 3 ? "critical" : "warning",
        expectedOutOfStockDays,
        recommendedOrderQty,
        message: isBelowSafetyStock
          ? "Below safety stock"
          : "Will run out before lead time",
      };
    })
    .filter(Boolean);

  console.log("[alertService] products:", products);
  console.log("[alertService] generated alerts:", alerts);

  return { alerts };
};