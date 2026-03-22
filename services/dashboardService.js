import { avgDailySales, expectedOutOfStockDays } from "../utils/calc.js";
import { getRawProducts } from "./productService.js";

export const getDashboardMetrics = async () => {
  const products = await getRawProducts();

  const analyzed = products.map((product) => {
    const avg = avgDailySales(product.salesLast7Days);
    const days = expectedOutOfStockDays(product.stock, avg);

    return {
      ...product,
      avgDailySales: avg,
      expectedOutOfStockDays: days,
    };
  });

  const totalProducts = analyzed.length;
  const lowStockProducts = analyzed.filter(
    (item) => item.expectedOutOfStockDays <= 7
  ).length;
  const criticalProducts = analyzed.filter(
    (item) => item.expectedOutOfStockDays <= 3
  ).length;

  const todaySales = analyzed.reduce((sum, item) => {
    return sum + Math.round(item.avgDailySales * 10000);
  }, 0);

  const avgDailySalesAmount = Math.round(
    todaySales / (totalProducts || 1)
  );

  return {
    totalProducts,
    lowStockProducts,
    criticalProducts,
    todaySales,
    avgDailySales: avgDailySalesAmount,
  };
};