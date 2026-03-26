import db from "../config/db.js";

export const createStore = async (store) => {
  const { shopName, shopDomain, accessToken } = store;

  const [result] = await db.query(
    "INSERT INTO stores (shop_name, shop_domain, access_token) VALUES (?, ?, ?)",
    [shopName, shopDomain, accessToken]
  );

  return {
    id: result.insertId,
    shopName,
    shopDomain
  };
};

export const getStores = async () => {
  const [rows] = await db.query(
    "SELECT id, shop_name AS shopName, shop_domain AS shopDomain, created_at AS createdAt FROM stores"
  );
  return rows;
};

export const getStoreById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, shop_name AS shopName, shop_domain AS shopDomain, access_token AS accessToken FROM stores WHERE id = ?",
    [id]
  );

  return rows[0] || null;
};