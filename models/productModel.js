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

export const getAllProducts = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM products
    ORDER BY id DESC
  `);

  return rows;
};

export const deleteByStoreId = async (storeId) => {
  const [result] = await db.query(
    `
    DELETE FROM products
    WHERE store_id = ?
    `,
    [storeId]
  );

  return result;
};
export const getProductById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0];
};