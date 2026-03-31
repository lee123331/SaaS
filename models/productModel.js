import db from "../config/db.js";

export const upsertFromShopify = async ({
  storeId,
  shopifyProductId,
  shopifyVariantId,
  title,
  sku,
  stock,
  status,
}) => {
  const [result] = await db.query(
    `
    INSERT INTO products (
      store_id,
      shopify_product_id,
      shopify_variant_id,
      title,
      sku,
      stock,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      sku = VALUES(sku),
      stock = VALUES(stock),
      status = VALUES(status)
    `,
    [
      storeId,
      shopifyProductId,
      shopifyVariantId,
      title,
      sku,
      stock,
      status,
    ]
  );

  return result;
};