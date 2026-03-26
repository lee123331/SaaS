import db from "../config/db.js";

export const upsertProduct = async ({
  storeId,
  shopifyProductId,
  title,
  sku,
  stock,
}) => {
  await db.query(
    `
    INSERT INTO products (store_id, shopify_product_id, title, sku, stock)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      sku = VALUES(sku),
      stock = VALUES(stock)
    `,
    [storeId, shopifyProductId, title, sku, stock]
  );
};

export const getAllProducts = async () => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      title AS name,
      sku,
      stock,
      shopify_product_id AS shopifyProductId
    FROM products
    ORDER BY id DESC
    `
  );
  return rows;
};

export const getProductById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      title AS name,
      sku,
      stock,
      shopify_product_id AS shopifyProductId
    FROM products
    WHERE id = ?
    `,
    [id]
  );
  return rows[0] || null;
};