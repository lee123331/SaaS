import * as productModel from "../models/productModel.js";

export const getProducts = async () => {
  const products = await productModel.getAllProducts();

  return products.map((product) => ({
    id: product.id,
    name: product.title,
    sku: product.sku,
    stock: product.stock,
    imageUrl: product.image_url || null,
    avgDailySales: 0,
    expectedOutOfStockDays: 0,
    status: product.stock <= 10 ? "warning" : "safe",
  }));
};

export const getProductDetail = async (id) => {
  const product = await productModel.getProductById(id);

  if (!product) return null;

  return {
    id: product.id,
    name: product.title,
    sku: product.sku,
    stock: product.stock,
    imageUrl: product.image_url || null,
    avgDailySales: 0,
    salesLast7Days: 0,
    salesLast30Days: 0,
    expectedOutOfStockDays: 0,
    leadTimeDays: 0,
    safetyStock: 0,
    recommendedOrderQty: 0,
    status: product.stock <= 10 ? "warning" : "safe",
  };
};