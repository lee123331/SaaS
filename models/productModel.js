import db from "../config/db.js";

export const upsertFromShopify = async ({
  storeId,
  shopifyProductId,
  shopifyVariantId,
  title,
  sku,
  stock,
  status,
  imageUrl,
}) => {
  const sql = `
    INSERT INTO products (
      store_id,
      shopify_product_id,
      shopify_variant_id,
      title,
      sku,
      stock,
      status,
      image_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      sku = VALUES(sku),
      stock = VALUES(stock),
      status = VALUES(status),
      image_url = VALUES(image_url),
      updated_at = CURRENT_TIMESTAMP
  `;

  const [result] = await db.execute(sql, [
    storeId,
    shopifyProductId,
    shopifyVariantId,
    title,
    sku,
    stock,
    status,
    imageUrl,
  ]);

  return result;
};

export const getAllProducts = async () => {
  const sql = `
    SELECT
      id,
      store_id,
      shopify_product_id,
      shopify_variant_id,
      title,
      sku,
      stock,
      status,
      image_url,
      created_at,
      updated_at
    FROM products
    ORDER BY id DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

export const getProductById = async (id) => {
  const sql = `
    SELECT
      id,
      store_id,
      shopify_product_id,
      shopify_variant_id,
      title,
      sku,
      stock,
      status,
      image_url,
      created_at,
      updated_at
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [id]);
  return rows[0] || null;
};

export const deleteByStoreId = async (storeId) => {
  const sql = `DELETE FROM products WHERE store_id = ?`;
  const [result] = await db.execute(sql, [storeId]);
  return result;
};