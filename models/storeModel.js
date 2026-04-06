import db from "../config/db.js";

export const createStore = async (store) => {
  const {
    shop_name = null,
    shop_domain,
    access_token,
  } = store;

  const [result] = await db.query(
    `
    INSERT INTO stores (
      shop_name,
      shop_domain,
      access_token
    ) VALUES (?, ?, ?)
    `,
    [shop_name, shop_domain, access_token]
  );

  return result;
};

export const getStores = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM stores
    ORDER BY id DESC
  `);

  return rows;
};

export const getStoreById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM stores
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0];
};

export const getStoreByShopDomain = async (shopDomain) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM stores
    WHERE shop_domain = ?
    LIMIT 1
    `,
    [shopDomain]
  );

  return rows[0];
};

export const updateStoreByShopDomain = async (shopDomain, payload) => {
  const {
    shop_name = null,
    access_token,
  } = payload;

  const [result] = await db.query(
    `
    UPDATE stores
    SET
      shop_name = ?,
      access_token = ?
    WHERE shop_domain = ?
    `,
    [shop_name, access_token, shopDomain]
  );

  return result;
};
export const deleteStoreById = async (id) => {
  const [result] = await db.query(
    `
    DELETE FROM stores
    WHERE id = ?
    `,
    [id]
  );

  return result;
};