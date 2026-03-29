import axios from "axios";
import db from "../config/db.js";

export const syncStore = async (req, res) => {
  try {
    const { id } = req.params;

    const [stores] = await db.query(
      "SELECT * FROM stores WHERE id=?",
      [id]
    );

    const store = stores[0];

    if (!store) {
      return res.json({ success: false, message: "스토어 없음" });
    }

    const response = await axios.get(
      `https://${store.shop_domain}/admin/api/2023-10/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": store.access_token,
        },
      }
    );

    const products = response.data.products;

    for (const product of products) {
      await db.query(
        `INSERT INTO products 
        (store_id, shopify_product_id, title, inventory)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        title=?, inventory=?`,
        [
          store.id,
          product.id,
          product.title,
          product.variants[0].inventory_quantity,
          product.title,
          product.variants[0].inventory_quantity,
        ]
      );
    }

    res.json({
      success: true,
      count: products.length,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};