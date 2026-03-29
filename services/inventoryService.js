import * as productModel from "../models/productModel.js";
import * as alertModel from "../models/alertModel.js";

const LOW_STOCK_THRESHOLD = 10;

export const analyzeInventory = async () => {
  const products = await productModel.getAllProducts();

  let createdCount = 0;

  for (const product of products) {
    if (product.stock <= LOW_STOCK_THRESHOLD) {
      const exists = await alertModel.existsPendingLowStockAlert(product.id);

      if (!exists) {
        await alertModel.createAlert({
          productId: product.id,
          type: "low_stock",
          message:
            product.stock <= 3
              ? "재고가 매우 적습니다. 즉시 발주 검토 필요"
              : "재고가 부족합니다. 발주 검토 필요",
        });

        createdCount += 1;
      }
    }
  }

  return {
    analyzedCount: products.length,
    createdCount,
  };
};