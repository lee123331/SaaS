import pool from "../config/db.js";

/**
 * suppliers
 */

export const createSupplier = async (payload) => {
  const {
    name,
    providerType = "custom",
    apiBaseUrl = "",
    orderEndpoint = "",
    authType = "apiKey",
    apiKey = null,
    apiSecret = null,
    defaultHeaders = null,
    contactName = null,
    contactEmail = null,
    contactPhone = null,
    status = "active",
    payloadTemplate = null,
    integrationType = "api",
    connectionStatus = "pending",
    notes = null,
  } = payload;

  const [result] = await pool.query(
    `
    INSERT INTO suppliers (
      name,
      providerType,
      apiBaseUrl,
      orderEndpoint,
      authType,
      apiKey,
      apiSecret,
      defaultHeaders,
      contactName,
      contactEmail,
      contactPhone,
      status,
      payloadTemplate,
      integrationType,
      connectionStatus,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      providerType,
      apiBaseUrl,
      orderEndpoint,
      authType,
      apiKey,
      apiSecret,
      defaultHeaders ? JSON.stringify(defaultHeaders) : null,
      contactName,
      contactEmail,
      contactPhone,
      status,
      payloadTemplate ? JSON.stringify(payloadTemplate) : null,
      integrationType,
      connectionStatus,
      notes,
    ]
  );

  return result;
};

export const getSuppliers = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      providerType,
      apiBaseUrl,
      orderEndpoint,
      authType,
      contactName,
      contactEmail,
      contactPhone,
      status,
      integrationType,
      connectionStatus,
      notes,
      createdAt,
      updatedAt
    FROM suppliers
    ORDER BY updatedAt DESC
    `
  );

  return rows;
};

export const getSupplierById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      providerType,
      apiBaseUrl,
      orderEndpoint,
      authType,
      apiKey,
      apiSecret,
      defaultHeaders,
      contactName,
      contactEmail,
      contactPhone,
      status,
      payloadTemplate,
      integrationType,
      connectionStatus,
      notes,
      createdAt,
      updatedAt
    FROM suppliers
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

export const getSupplierBasicById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      providerType,
      status,
      connectionStatus
    FROM suppliers
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

export const updateSupplierById = async (id, payload) => {
  const allowedFields = [
    "name",
    "providerType",
    "apiBaseUrl",
    "orderEndpoint",
    "authType",
    "apiKey",
    "apiSecret",
    "defaultHeaders",
    "contactName",
    "contactEmail",
    "contactPhone",
    "status",
    "payloadTemplate",
    "integrationType",
    "connectionStatus",
    "notes",
  ];

  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      fields.push(`${field} = ?`);

      if (field === "defaultHeaders" || field === "payloadTemplate") {
        values.push(payload[field] ? JSON.stringify(payload[field]) : null);
      } else {
        values.push(payload[field]);
      }
    }
  }

  if (!fields.length) {
    return { affectedRows: 0 };
  }

  values.push(id);

  const [result] = await pool.query(
    `
    UPDATE suppliers
    SET ${fields.join(", ")}
    WHERE id = ?
    `,
    values
  );

  return result;
};

/**
 * supplier_connections
 */

export const upsertSupplierConnection = async (supplierId, configJson = {}) => {
  const [result] = await pool.query(
    `
    INSERT INTO supplier_connections (
      supplierId,
      configJson
    )
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      configJson = VALUES(configJson),
      updatedAt = CURRENT_TIMESTAMP
    `,
    [supplierId, JSON.stringify(configJson)]
  );

  return result;
};

export const getSupplierConnection = async (supplierId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      supplierId,
      configJson,
      createdAt,
      updatedAt
    FROM supplier_connections
    WHERE supplierId = ?
    LIMIT 1
    `,
    [supplierId]
  );

  return rows[0] || null;
};

/**
 * supplier_product_mappings
 */

export const createSupplierProductMapping = async (payload) => {
  const {
    supplierId,
    productId,
    internalProductId = productId,
    internalVariantId,
    internalSku = null,
    supplierSku = null,
    supplierProductName = null,
    minOrderQty = null,
    mappingStatus = "suggested",
    source = "manual",
    confidenceScore = 0,
    reason = null,
  } = normalizeMappingPayload(payload);

  const [result] = await pool.query(
    `
    INSERT INTO supplier_product_mappings (
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      supplierSku,
      supplierProductName,
      minOrderQty,
      mappingStatus,
      source,
      confidenceScore,
      reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      supplierSku,
      supplierProductName,
      minOrderQty,
      mappingStatus,
      source,
      confidenceScore,
      reason,
    ]
  );

  return result;
};

export const getSupplierProductMappings = async (supplierId) => {
  const [rows] = await pool.query(
    `
    SELECT
      spm.id,
      spm.supplierId,
      s.name AS supplierName,
      spm.productId,
      spm.internalProductId,
      spm.internalVariantId,
      spm.internalSku,
      spm.supplierSku,
      spm.supplierProductName,
      spm.minOrderQty,
      spm.mappingStatus,
      spm.source,
      spm.confidenceScore,
      spm.reason,
      spm.createdAt,
      spm.updatedAt
    FROM supplier_product_mappings spm
    JOIN suppliers s ON s.id = spm.supplierId
    WHERE spm.supplierId = ?
    ORDER BY spm.updatedAt DESC
    `,
    [supplierId]
  );

  return rows;
};

export const getConfirmedMappingByVariantId = async (variantId) => {
  const [rows] = await pool.query(
    `
    SELECT
      spm.id,
      spm.supplierId,
      s.name AS supplierName,
      s.providerType,
      s.apiBaseUrl,
      s.orderEndpoint,
      s.authType,
      s.contactName,
      s.contactEmail,
      s.contactPhone,
      s.status AS supplierStatus,
      s.connectionStatus,

      spm.productId,
      spm.internalProductId,
      spm.internalVariantId,
      spm.internalSku,
      spm.supplierSku,
      spm.supplierProductName,
      spm.minOrderQty,
      spm.mappingStatus,
      spm.source,
      spm.confidenceScore,
      spm.reason,
      spm.createdAt,
      spm.updatedAt
    FROM supplier_product_mappings spm
    JOIN suppliers s ON s.id = spm.supplierId
    WHERE spm.internalVariantId = ?
      AND spm.mappingStatus IN ('confirmed', 'active', 'connected')
    ORDER BY spm.updatedAt DESC
    LIMIT 1
    `,
    [variantId]
  );

  return rows[0] || null;
};

export const upsertConfirmedSupplierMapping = async (payload) => {
  const {
    supplierId,
    productId,
    internalProductId = productId,
    internalVariantId,
    internalSku = null,
    supplierSku = null,
    supplierProductName = null,
    minOrderQty = null,
    source = "manual",
    confidenceScore = 100,
    reason = "confirmed by user",
  } = normalizeMappingPayload(payload);

  /**
   * 같은 variant에 이미 매핑이 있으면 업데이트,
   * 없으면 새로 생성.
   */
  const [existingRows] = await pool.query(
    `
    SELECT id
    FROM supplier_product_mappings
    WHERE internalVariantId = ?
    LIMIT 1
    `,
    [internalVariantId]
  );

  if (existingRows.length) {
    const mappingId = existingRows[0].id;

    await pool.query(
      `
      UPDATE supplier_product_mappings
      SET
        supplierId = ?,
        productId = ?,
        internalProductId = ?,
        internalSku = ?,
        supplierSku = ?,
        supplierProductName = ?,
        minOrderQty = ?,
        mappingStatus = 'confirmed',
        source = ?,
        confidenceScore = ?,
        reason = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        supplierId,
        productId,
        internalProductId,
        internalSku,
        supplierSku,
        supplierProductName,
        minOrderQty,
        source,
        confidenceScore,
        reason,
        mappingId,
      ]
    );

    return { id: mappingId, updated: true };
  }

  const [result] = await pool.query(
    `
    INSERT INTO supplier_product_mappings (
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      supplierSku,
      supplierProductName,
      minOrderQty,
      mappingStatus,
      source,
      confidenceScore,
      reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `,
    [
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      supplierSku,
      supplierProductName,
      minOrderQty,
      source,
      confidenceScore,
      reason,
    ]
  );

  return { id: result.insertId, inserted: true };
};

/**
 * recommendations
 */

export const getSupplierRecommendationByPurchaseHistory = async (productId) => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id AS supplierId,
      s.name AS supplierName,
      COUNT(po.id) AS orderCount
    FROM purchase_orders po
    JOIN suppliers s ON s.id = po.supplierId
    WHERE po.productId = ?
    GROUP BY s.id, s.name
    ORDER BY orderCount DESC
    LIMIT 5
    `,
    [productId]
  );

  return rows;
};

export const getSupplierRecommendationsByVendor = async (vendor) => {
  if (!vendor) return [];

  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      providerType,
      status,
      connectionStatus
    FROM suppliers
    WHERE status = 'active'
      AND (
        name LIKE ?
        OR notes LIKE ?
        OR providerType LIKE ?
      )
    ORDER BY updatedAt DESC
    LIMIT 5
    `,
    [`%${vendor}%`, `%${vendor}%`, `%${vendor}%`]
  );

  return rows;
};

/**
 * helpers
 */

const normalizeMappingPayload = (payload = {}) => {
  const supplierId = Number(payload.supplierId ?? payload.supplier_id);
  const productId = Number(
    payload.productId ??
      payload.product_id ??
      payload.internalProductId ??
      payload.internal_product_id
  );
  const internalProductId = Number(
    payload.internalProductId ?? payload.internal_product_id ?? productId
  );
  const internalVariantId = Number(
    payload.internalVariantId ??
      payload.internal_variant_id ??
      payload.variantId ??
      payload.variant_id
  );

  if (!Number.isFinite(supplierId)) {
    throw new Error("supplierId는 필수입니다.");
  }

  if (!Number.isFinite(productId)) {
    throw new Error("productId는 필수입니다.");
  }

  if (!Number.isFinite(internalProductId)) {
    throw new Error("internalProductId는 필수입니다.");
  }

  if (!Number.isFinite(internalVariantId)) {
    throw new Error("internalVariantId는 필수입니다.");
  }

  return {
    supplierId,
    productId,
    internalProductId,
    internalVariantId,
    internalSku: payload.internalSku ?? payload.internal_sku ?? null,
    supplierSku: payload.supplierSku ?? payload.supplier_sku ?? null,
    supplierProductName:
      payload.supplierProductName ?? payload.supplier_product_name ?? null,
    minOrderQty:
      payload.minOrderQty ?? payload.min_order_qty
        ? Number(payload.minOrderQty ?? payload.min_order_qty)
        : null,
    mappingStatus:
      payload.mappingStatus ?? payload.mapping_status ?? "suggested",
    source: payload.source ?? payload.order_method ?? "manual",
    confidenceScore: Number(
      payload.confidenceScore ?? payload.confidence_score ?? payload.match_score ?? 0
    ),
    reason: payload.reason ?? null,
  };
};

export const getActiveSuppliersForRecommendation = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      providerType,
      status,
      connectionStatus,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      createdAt,
      updatedAt
    FROM suppliers
    WHERE status = 'active'
    ORDER BY updatedAt DESC
    LIMIT 20
    `
  );

  return rows;
};
export default {
  createSupplier,
  getSuppliers,
  getSupplierById,
  getSupplierBasicById,
  updateSupplierById,
  upsertSupplierConnection,
  getSupplierConnection,
  createSupplierProductMapping,
  getSupplierProductMappings,
  getConfirmedMappingByVariantId,
  upsertConfirmedSupplierMapping,
  getSupplierRecommendationByPurchaseHistory,
  getSupplierRecommendationsByVendor,
};

