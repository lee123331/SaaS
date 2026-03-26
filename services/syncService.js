import * as storeModel from "../models/storeModel.js";
import * as productModel from "../models/productModel.js";
import { fetchShopifyProducts } from "./shopifyService.js";

export const syncStoreProducts = async (storeId) => {
  const store = await storeModel.getStoreById(storeId);

  if (!store) {
    throw new Error("스토어를 찾을 수 없습니다.");
  }

  const products = await fetchShopifyProducts({
    shopDomain: store.shopDomain,
    accessToken: store.accessToken,
  });

  for (const product of products) {
    const firstVariant = product.variants?.[0];

    await productModel.upsertProduct({
      storeId,
      shopifyProductId: product.id,
      title: product.title,
      sku: firstVariant?.sku || null,
      stock: firstVariant?.inventory_quantity || 0,
    });
  }

  return {
    syncedCount: products.length,
  };
};