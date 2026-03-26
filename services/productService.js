<<<<<<< HEAD
import * as productModel from "../models/productModel.js";

export const getProducts = async () => {
  const products = await productModel.getAllProducts();

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    avgDailySales: 0,
    expectedOutOfStockDays: 0,
    status: product.stock <= 10 ? "warning" : "safe",
  }));
};

export const getProductDetail = async (id) => {
  const product = await productModel.getProductById(id);

  if (!product) return null;

=======
import {
  avgDailySales,
  expectedOutOfStockDays,
  getStatus,
  recommendedOrderQty,
} from "../utils/calc.js";

const productsMock = [
  {
    id: 1,
    name: "에어팟 케이스",
    sku: "AP-001",
    stock: 42,
    salesLast7Days: 42,
    salesLast30Days: 180,
    leadTimeDays: 5,
    safetyStock: 20,
  },
  {
    id: 2,
    name: "고양이 장난감 세트",
    sku: "CT-002",
    stock: 15,
    salesLast7Days: 28,
    salesLast30Days: 90,
    leadTimeDays: 4,
    safetyStock: 15,
  },
  {
    id: 3,
    name: "반려동물 간식팩",
    sku: "PT-003",
    stock: 120,
    salesLast7Days: 14,
    salesLast30Days: 60,
    leadTimeDays: 7,
    safetyStock: 25,
  },
];

export const getProducts = async () => {
  return productsMock.map((product) => {
    const avg = avgDailySales(product.salesLast7Days);
    const days = expectedOutOfStockDays(product.stock, avg);

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      avgDailySales: avg,
      expectedOutOfStockDays: days,
      status: getStatus(days),
    };
  });
};

export const getProductDetail = async (id) => {
  const product = productsMock.find((item) => item.id === id);
  if (!product) return null;

  const avg = avgDailySales(product.salesLast7Days);
  const days = expectedOutOfStockDays(product.stock, avg);
  const recommendedQty = recommendedOrderQty(
    avg,
    product.safetyStock,
    product.stock
  );

>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock: product.stock,
<<<<<<< HEAD
    avgDailySales: 0,
    salesLast7Days: 0,
    salesLast30Days: 0,
    expectedOutOfStockDays: 0,
    leadTimeDays: 0,
    safetyStock: 0,
    recommendedOrderQty: 0,
    status: product.stock <= 10 ? "warning" : "safe",
  };
=======
    avgDailySales: avg,
    salesLast7Days: product.salesLast7Days,
    salesLast30Days: product.salesLast30Days,
    expectedOutOfStockDays: days,
    leadTimeDays: product.leadTimeDays,
    safetyStock: product.safetyStock,
    recommendedOrderQty: recommendedQty,
    status: getStatus(days),
  };
};

export const getRawProducts = async () => {
  return productsMock;
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361
};