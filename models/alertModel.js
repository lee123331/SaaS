import db from "../config/db.js";

export const createAlert = async ({ productId, type, message }) => {
  await db.query(
    `
    INSERT INTO alerts (product_id, type, message)
    VALUES (?, ?, ?)
    `,
    [productId, type, message]
  );
};

export const getAlerts = async () => {
  const [rows] = await db.query(
    `
    SELECT
      alerts.id,
      alerts.product_id AS productId,
      alerts.type,
      alerts.message,
      alerts.status,
      alerts.created_at AS createdAt,
      products.title AS productName,
      products.stock
    FROM alerts
    JOIN products ON alerts.product_id = products.id
    ORDER BY alerts.id DESC
    `
  );

  return rows;
};

export const existsPendingLowStockAlert = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM alerts
    WHERE product_id = ?
      AND type = 'low_stock'
      AND status = 'pending'
    LIMIT 1
    `,
    [productId]
  );

  return rows.length > 0;
};