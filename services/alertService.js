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
};