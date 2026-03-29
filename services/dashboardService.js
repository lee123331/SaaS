import * as productModel from "../models/productModel.js";
import * as alertModel from "../models/alertModel.js";

export const getDashboardMetrics = async () => {
  const products = await productModel.getAllProducts();
  const alerts = await alertModel.getAlerts();

  const totalProducts = products.length;
  const lowStockProducts = products.filter((item) => item.stock <= 10).length;
  const criticalProducts = products.filter((item) => item.stock <= 3).length;

  return {
    totalProducts,
    lowStockProducts,
    criticalProducts,
    totalAlerts: alerts.length,
    todaySales: 0,
    avgDailySales: 0,
  };
};