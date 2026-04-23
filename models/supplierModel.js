import db from "../config/db.js";

const toJsonString = (value) => {
  if (value === undefined || value === null) return null;
  return typeof value === "string" ? value : JSON.stringify(value);
};

const safeParseJson = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeSupplierRow = (row) => {
  if (!row) return row;

  return {
    ...row,
    defaultHeaders: safeParseJson(row.defaultHeaders),
    payloadTemplate: safeParseJson(row.payloadTemplate),
  };
};

const normalizeConnectionRow = (row) => {
  if (!row) return row;

  return {
    ...row,
    configJson: safeParseJson(row.configJson),
  };
};

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

  const [result] = await db.query(
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      providerType,
      apiBaseUrl,
      orderEndpoint,
      authType,
      apiKey,
      apiSecret,
      toJsonString(defaultHeaders),
      contactName,
      contactEmail,
      contactPhone,
      status,
      toJsonString(payloadTemplate),
      integrationType,
      connectionStatus,
      notes,
    ]
  );

  return result;
};

export const getSuppliers = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM suppliers
    ORDER BY id DESC
  `);

  return rows.map(normalizeSupplierRow);
};

export const getSupplierById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM suppliers
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return normalizeSupplierRow(rows[0]);
};

export const getSupplierBasicById = async (supplierId) => {
  const [rows] = await db.query(
    `
    SELECT id, name, status
    FROM suppliers
    WHERE id = ?
    LIMIT 1
    `,
    [supplierId]
  );

  return rows[0] || null;
};

export const updateSupplierById = async (id, payload) => {
  const current = await getSupplierById(id);
  if (!current) return null;

  const next = {
    name: payload.name ?? current.name,
    providerType: payload.providerType ?? current.providerType,
    apiBaseUrl: payload.apiBaseUrl ?? current.apiBaseUrl,
    orderEndpoint: payload.orderEndpoint ?? current.orderEndpoint,
    authType: payload.authType ?? current.authType,
    apiKey: payload.apiKey ?? current.apiKey,
    apiSecret: payload.apiSecret ?? current.apiSecret,
    defaultHeaders:
      payload.defaultHeaders !== undefined
        ? payload.defaultHeaders
        : current.defaultHeaders,
    contactName: payload.contactName ?? current.contactName,
    contactEmail: payload.contactEmail ?? current.contactEmail,
    contactPhone: payload.contactPhone ?? current.contactPhone,
    status: payload.status ?? current.status,
    payloadTemplate:
      payload.payloadTemplate !== undefined
        ? payload.payloadTemplate
        : current.payloadTemplate,
    integrationType: payload.integrationType ?? current.integrationType,
    connectionStatus: payload.connectionStatus ?? current.connectionStatus,
    notes: payload.notes ?? current.notes,
  };

  const [result] = await db.query(
    `
    UPDATE suppliers
    SET
      name = ?,
      providerType = ?,
      apiBaseUrl = ?,
      orderEndpoint = ?,
      authType = ?,
      apiKey = ?,
      apiSecret = ?,
      defaultHeaders = ?,
      contactName = ?,
      contactEmail = ?,
      contactPhone = ?,
      status = ?,
      payloadTemplate = ?,
      integrationType = ?,
      connectionStatus = ?,
      notes = ?
    WHERE id = ?
    `,
    [
      next.name,
      next.providerType,
      next.apiBaseUrl,
      next.orderEndpoint,
      next.authType,
      next.apiKey,
      next.apiSecret,
      toJsonString(next.defaultHeaders),
      next.contactName,
      next.contactEmail,
      next.contactPhone,
      next.status,
      toJsonString(next.payloadTemplate),
      next.integrationType,
      next.connectionStatus,
      next.notes,
      id,
    ]
  );

  return result;
};

export const upsertSupplierConnection = async (supplierId, configJson = {}) => {
  const [existing] = await db.query(
    `
    SELECT *
    FROM supplier_connections
    WHERE supplierId = ?
    LIMIT 1
    `,
    [supplierId]
  );

  if (existing[0]) {
    const [result] = await db.query(
      `
      UPDATE supplier_connections
      SET
        configJson = ?,
        updatedAt = NOW()
      WHERE supplierId = ?
      `,
      [toJsonString(configJson), supplierId]
    );

    return result;
  }

  const [result] = await db.query(
    `
    INSERT INTO supplier_connections (
      supplierId,
      configJson
    ) VALUES (?, ?)
    `,
    [supplierId, toJsonString(configJson)]
  );

  return result;
};

export const getSupplierConnection = async (supplierId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM supplier_connections
    WHERE supplierId = ?
    LIMIT 1
    `,
    [supplierId]
  );

  return normalizeConnectionRow(rows[0]);
};

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
  } = payload;

  const [result] = await db.query(
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  const [rows] = await db.query(
    `
    SELECT *
    FROM supplier_product_mappings
    WHERE supplierId = ?
    ORDER BY id DESC
    `,
    [supplierId]
  );

  return rows;
};

export const getSupplierProductMappingByProductId = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM supplier_product_mappings
    WHERE productId = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [productId]
  );

  return rows[0] || null;
};

export const getConfirmedMappingByVariantId = async (variantId) => {
  const [rows] = await db.query(
    `
    SELECT
      spm.*,
      s.name AS supplierName
    FROM supplier_product_mappings spm
    JOIN suppliers s ON spm.supplierId = s.id
    WHERE spm.internalVariantId = ?
      AND spm.mappingStatus = 'confirmed'
    ORDER BY spm.updatedAt DESC
    LIMIT 1
    `,
    [variantId]
  );

  return rows[0] || null;
};

export const getSupplierRecommendationByPurchaseHistory = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT
      po.supplierId,
      s.name AS supplierName,
      COUNT(*) AS orderCount,
      MAX(po.created_at) AS lastOrderedAt
    FROM purchase_orders po
    JOIN suppliers s ON po.supplierId = s.id
    WHERE po.productId = ?
      AND po.supplierId IS NOT NULL
    GROUP BY po.supplierId, s.name
    ORDER BY orderCount DESC, lastOrderedAt DESC
    `,
    [productId]
  );

  return rows;
};

export const getSupplierRecommendationsByVendor = async (vendor) => {
  if (!vendor) return [];

  const normalizedVendor = vendor.trim().toLowerCase();

  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      apiBaseUrl
    FROM suppliers
    WHERE LOWER(name) = ?
       OR LOWER(name) LIKE CONCAT('%', ?, '%')
       OR LOWER(apiBaseUrl) LIKE CONCAT('%', ?, '%')
    ORDER BY id DESC
    `,
    [normalizedVendor, normalizedVendor, normalizedVendor]
  );

  return rows;
};

export const upsertConfirmedSupplierMapping = async ({
  supplierId,
  internalProductId,
  internalVariantId,
  internalSku,
  productId,
  source = "manual",
  confidenceScore = 100,
  reason = "confirmed by user",
}) => {
  const [existingRows] = await db.query(
    `
    SELECT id
    FROM supplier_product_mappings
    WHERE internalVariantId = ?
      AND supplierId = ?
    LIMIT 1
    `,
    [internalVariantId, supplierId]
  );

  if (existingRows[0]) {
    const [result] = await db.query(
      `
      UPDATE supplier_product_mappings
      SET
        internalProductId = ?,
        internalSku = ?,
        productId = ?,
        mappingStatus = 'confirmed',
        source = ?,
        confidenceScore = ?,
        reason = ?,
        updatedAt = NOW()
      WHERE id = ?
      `,
      [
        internalProductId,
        internalSku,
        productId,
        source,
        confidenceScore,
        reason,
        existingRows[0].id,
      ]
    );

    return { type: "updated", id: existingRows[0].id, result };
  }

  const [result] = await db.query(
    `
    INSERT INTO supplier_product_mappings (
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      mappingStatus,
      source,
      confidenceScore,
      reason
    ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `,
    [
      supplierId,
      productId,
      internalProductId,
      internalVariantId,
      internalSku,
      source,
      confidenceScore,
      reason,
    ]
  );

  return { type: "created", id: result.insertId, result };
};

export const getActiveSupplierConnectionByProductId = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT
      spm.*,
      s.id AS supplierId,
      s.name AS supplierName,
      s.status AS supplierStatus,
      s.connectionStatus,
      sc.id AS supplierConnectionId,
      sc.supplierId AS connectedSupplierId,
      sc.configJson
    FROM supplier_product_mappings spm
    JOIN suppliers s ON spm.supplierId = s.id
    LEFT JOIN supplier_connections sc ON sc.supplierId = s.id
    WHERE spm.productId = ?
      AND spm.mappingStatus = 'confirmed'
    ORDER BY spm.id DESC
    LIMIT 1
    `,
    [productId]
  );

  return normalizeConnectionRow(rows[0]);
};

const SupplierModel = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  getSupplierBasicById,
  updateSupplierById,
  upsertSupplierConnection,
  getSupplierConnection,
  createSupplierProductMapping,
  getSupplierProductMappings,
  getSupplierProductMappingByProductId,
  getConfirmedMappingByVariantId,
  getSupplierRecommendationByPurchaseHistory,
  getSupplierRecommendationsByVendor,
  upsertConfirmedSupplierMapping,
  getActiveSupplierConnectionByProductId,
};

export default SupplierModel;