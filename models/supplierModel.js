// models/supplierModel.js
import db from "../config/db.js";

const SupplierModel = {
  async getAllActiveSuppliers() {
    const [rows] = await db.query(`
      SELECT *
      FROM suppliers
      WHERE status = 'active'
      ORDER BY createdAt DESC
    `);

    return rows;
  },

  async getSupplierById(id) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM suppliers
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  },

  async getSupplierByProductId(productId) {
    const [rows] = await db.query(
      `
      SELECT
        s.*,
        p.supplierProductCode,
        p.name AS productName
      FROM products p
      JOIN suppliers s ON p.supplierId = s.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [productId]
    );

    return rows[0];
  },
};

export default SupplierModel;