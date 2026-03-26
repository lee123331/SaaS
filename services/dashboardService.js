<<<<<<< HEAD
import * as productModel from "../models/productModel.js";

export const getDashboardMetrics = async () => {
  const products = await productModel.getAllProducts();

  const totalProducts = products.length;
  const lowStockProducts = products.filter((item) => item.stock <= 10).length;
  const criticalProducts = products.filter((item) => item.stock <= 3).length;
=======
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
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361

  return {
    totalProducts,
    lowStockProducts,
    criticalProducts,
<<<<<<< HEAD
    todaySales: 0,
    avgDailySales: 0,
=======
    todaySales,
    avgDailySales: avgDailySalesAmount,
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361
  };
};