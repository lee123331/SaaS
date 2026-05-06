import * as supplierModel from "../models/supplierModel.js";
import * as productModel from "../models/productModel.js";
import OrderModel from "../models/orderModel.js";

export const createSupplier = async (payload) => {
  if (!payload?.name) {
    throw new Error("공급처명(name)은 필수입니다.");
  }

  const result = await supplierModel.createSupplier(payload);
  const supplier = await supplierModel.getSupplierById(result.insertId);

  return {
    id: result.insertId,
    supplier,
    message: "공급처가 생성되었습니다.",
  };
};

export const getSuppliers = async () => {
  return supplierModel.getSuppliers();
};

export const getSupplierById = async (id) => {
  return supplierModel.getSupplierById(id);
};

export const updateSupplierById = async (id, payload) => {
  const current = await supplierModel.getSupplierById(id);

  if (!current) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  await supplierModel.updateSupplierById(id, payload);
  const updated = await supplierModel.getSupplierById(id);

  return {
    id,
    supplier: updated,
    message: "공급처가 수정되었습니다.",
  };
};

export const saveSupplierConnection = async (supplierId, configJson = {}) => {
  const supplier = await supplierModel.getSupplierById(supplierId);

  if (!supplier) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  await supplierModel.upsertSupplierConnection(supplierId, configJson);
  const connection = await supplierModel.getSupplierConnection(supplierId);

  return {
    supplierId,
    connection,
    message: "공급처 연결 설정이 저장되었습니다.",
  };
};

export const getSupplierConnection = async (supplierId) => {
  return supplierModel.getSupplierConnection(supplierId);
};

export const createSupplierProductMapping = async (supplierId, payload) => {
  const supplier = await supplierModel.getSupplierById(supplierId);

  if (!supplier) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  if (!payload?.productId && !payload?.product_id && !payload?.internal_product_id) {
    throw new Error("productId는 필수입니다.");
  }

  const result = await supplierModel.createSupplierProductMapping({
    ...payload,
    supplierId,
  });

  return {
    id: result.insertId,
    message: "공급처 상품 매핑이 저장되었습니다.",
  };
};

export const getSupplierProductMappings = async (supplierId) => {
  return supplierModel.getSupplierProductMappings(supplierId);
};

export const getRecommendedSuppliersByVariantId = async (variantId) => {
  if (!variantId) {
    throw new Error("variantId가 필요합니다.");
  }

  const numericVariantId = Number(variantId);

  const product = await productModel.getProductByVariantId(numericVariantId);

  if (!product) {
    throw new Error("해당 variant 상품을 찾을 수 없습니다.");
  }

  /**
   * 이미 확정된 매핑이 있으면 추천 후보가 아니라
   * auto_linked_supplier로 반환한다.
   */
  const confirmed = await supplierModel.getConfirmedMappingByVariantId(
    numericVariantId
  );

  if (confirmed) {
    return {
      variant_id: numericVariantId,
      internal_product_id: product.id,
      internal_sku: product.sku,

      auto_linked_supplier: {
        mapping_id: confirmed.id,
        supplier_id: confirmed.supplierId,
        supplier_name: confirmed.supplierName,

        internal_product_id: confirmed.internalProductId,
        internal_variant_id: confirmed.internalVariantId,
        internal_sku: confirmed.internalSku,

        supplier_sku: confirmed.supplierSku,
        supplier_product_name: confirmed.supplierProductName,
        min_order_qty: confirmed.minOrderQty,

        confidence_score: confirmed.confidenceScore ?? 100,
        source: confirmed.source ?? "confirmed",
        reason: confirmed.reason ?? "confirmed mapping exists",
        mapping_status: confirmed.mappingStatus,

        supplier_status: confirmed.supplierStatus,
        connection_status: confirmed.connectionStatus,

        contact_name: confirmed.contactName,
        contact_email: confirmed.contactEmail,
        contact_phone: confirmed.contactPhone,

        // camelCase 호환
        mappingId: confirmed.id,
        supplierId: confirmed.supplierId,
        supplierName: confirmed.supplierName,
        internalProductId: confirmed.internalProductId,
        internalVariantId: confirmed.internalVariantId,
        internalSku: confirmed.internalSku,
        supplierSku: confirmed.supplierSku,
        supplierProductName: confirmed.supplierProductName,
        minOrderQty: confirmed.minOrderQty,
        confidenceScore: confirmed.confidenceScore ?? 100,
        mappingStatus: confirmed.mappingStatus,
      },

      recommendations: [],
      status: "ok",
    };
  }

 const poRecommendations =
  await supplierModel.getSupplierRecommendationByPurchaseHistory(product.id);

const vendorRecommendations = product.vendor
  ? await supplierModel.getSupplierRecommendationsByVendor(product.vendor)
  : [];

const activeSuppliers =
  await supplierModel.getActiveSuppliersForRecommendation();

const merged = new Map();

for (const item of poRecommendations) {
  merged.set(item.supplierId, {
    supplier_id: item.supplierId,
    supplier_name: item.supplierName,
    confidence_score: 70,
    source: "po_history",
    reason: "matched by purchase order history",
    mapping_status: "suggested",

    supplierId: item.supplierId,
    supplierName: item.supplierName,
    confidenceScore: 70,
    mappingStatus: "suggested",
  });
}

for (const item of vendorRecommendations) {
  if (!merged.has(item.id)) {
    merged.set(item.id, {
      supplier_id: item.id,
      supplier_name: item.name,
      confidence_score: 50,
      source: "vendor",
      reason: "matched Shopify vendor",
      mapping_status: "suggested",

      supplierId: item.id,
      supplierName: item.name,
      confidenceScore: 50,
      mappingStatus: "suggested",
    });
  }
}

/**
 * fallback 추천:
 * 이미 등록된 active 공급처는 다른 상품에서도 추천 후보로 보여준다.
 */
for (const item of activeSuppliers) {
  if (!merged.has(item.id)) {
    merged.set(item.id, {
      supplier_id: item.id,
      supplier_name: item.name,
      confidence_score: 30,
      source: "registered_supplier",
      reason: "registered active supplier",
      mapping_status: "suggested",

      provider_type: item.providerType,
      supplier_status: item.status,
      connection_status: item.connectionStatus,
      contact_name: item.contactName,
      contact_email: item.contactEmail,
      contact_phone: item.contactPhone,

      supplierId: item.id,
      supplierName: item.name,
      confidenceScore: 30,
      mappingStatus: "suggested",
      providerType: item.providerType,
      supplierStatus: item.status,
      connectionStatus: item.connectionStatus,
      contactName: item.contactName,
      contactEmail: item.contactEmail,
      contactPhone: item.contactPhone,
    });
  }
}

const recommendations = Array.from(merged.values()).sort(
  (a, b) => b.confidence_score - a.confidence_score
);
  return {
    variant_id: numericVariantId,
    internal_product_id: product.id,
    internal_sku: product.sku,
    auto_linked_supplier: null,
    recommendations,
    status: "ok",
  };
};

export const confirmSupplierMapping = async (payload) => {
  const internalProductId = Number(
    payload.internal_product_id ??
      payload.internalProductId ??
      payload.product_id ??
      payload.productId
  );

  const internalVariantId = Number(
    payload.internal_variant_id ??
      payload.internalVariantId ??
      payload.variant_id ??
      payload.variantId
  );

  const supplierId = Number(payload.supplier_id ?? payload.supplierId);

  const internalSku =
    payload.internal_sku ?? payload.internalSku ?? null;

  const supplierSku =
    payload.supplier_sku ?? payload.supplierSku ?? null;

  const supplierProductName =
    payload.supplier_product_name ?? payload.supplierProductName ?? null;

  const minOrderQty =
    payload.min_order_qty ?? payload.minOrderQty ?? null;

  if (!internalProductId || !internalVariantId || !supplierId) {
    throw new Error(
      "internal_product_id, internal_variant_id, supplier_id는 필수입니다."
    );
  }

  const supplier = await supplierModel.getSupplierBasicById(supplierId);

  if (!supplier) {
    throw new Error("존재하지 않는 공급처입니다.");
  }

  const result = await supplierModel.upsertConfirmedSupplierMapping({
    supplierId,
    internalProductId,
    internalVariantId,
    internalSku,
    supplierSku,
    supplierProductName,
    minOrderQty,
    productId: internalProductId,
    source: payload.source ?? payload.order_method ?? "manual",
    confidenceScore: Number(
      payload.confidence_score ?? payload.confidenceScore ?? 100
    ),
    reason: payload.reason ?? "confirmed by user",
  });

  return {
    mapping_id: result.id,
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    mapping_status: "confirmed",

    // camelCase 호환
    mappingId: result.id,
    supplierId: supplier.id,
    supplierName: supplier.name,
    mappingStatus: "confirmed",

    message: "공급처가 확정되었습니다.",
  };
};

export const getConfirmedSupplierByVariantId = async (variantId) => {
  if (!variantId) {
    throw new Error("variantId가 필요합니다.");
  }

  const numericVariantId = Number(variantId);

  const mapping = await supplierModel.getConfirmedMappingByVariantId(
    numericVariantId
  );

  if (!mapping) {
    return null;
  }

  /**
   * 프론트가 새로고침 후에도 "이미 연결됨" 카드를 복원할 수 있도록
   * snake_case와 camelCase를 모두 내려준다.
   */
  return {
    connected: true,

    mapping_id: mapping.id,
    supplier_id: mapping.supplierId,
    supplier_name: mapping.supplierName,

    internal_product_id: mapping.internalProductId,
    internal_variant_id: mapping.internalVariantId,
    internal_sku: mapping.internalSku,

    supplier_sku: mapping.supplierSku,
    supplier_product_name: mapping.supplierProductName,
    min_order_qty: mapping.minOrderQty,

    mapping_status: mapping.mappingStatus,
    confidence_score: mapping.confidenceScore,
    source: mapping.source,
    reason: mapping.reason,

    supplier_status: mapping.supplierStatus,
    connection_status: mapping.connectionStatus,

    contact_name: mapping.contactName,
    contact_email: mapping.contactEmail,
    contact_phone: mapping.contactPhone,

    created_at: mapping.createdAt,
    updated_at: mapping.updatedAt,

    // camelCase 호환
    mappingId: mapping.id,
    supplierId: mapping.supplierId,
    supplierName: mapping.supplierName,

    internalProductId: mapping.internalProductId,
    internalVariantId: mapping.internalVariantId,
    internalSku: mapping.internalSku,

    supplierSku: mapping.supplierSku,
    supplierProductName: mapping.supplierProductName,
    minOrderQty: mapping.minOrderQty,

    mappingStatus: mapping.mappingStatus,
    confidenceScore: mapping.confidenceScore,

    supplierStatus: mapping.supplierStatus,
    connectionStatus: mapping.connectionStatus,

    contactName: mapping.contactName,
    contactEmail: mapping.contactEmail,
    contactPhone: mapping.contactPhone,

    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
  };
};

export const createOrderDraft = async (supplierId) => {
  const supplier = await supplierModel.getSupplierById(supplierId);

  if (!supplier) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  const mappings = await supplierModel.getSupplierProductMappings(supplierId);

  if (!mappings.length) {
    return {
      supplierId,
      items: [],
      message: "매핑된 상품이 없어 발주 초안을 생성할 수 없습니다.",
    };
  }

  const items = mappings.map((mapping) => ({
    productId: mapping.productId,
    internalProductId: mapping.internalProductId,
    internalVariantId: mapping.internalVariantId,
    internalSku: mapping.internalSku,
    supplierSku: mapping.supplierSku,
    supplierProductName: mapping.supplierProductName,
    minOrderQty: mapping.minOrderQty,
    mappingStatus: mapping.mappingStatus,

    // snake_case 호환
    product_id: mapping.productId,
    internal_product_id: mapping.internalProductId,
    internal_variant_id: mapping.internalVariantId,
    internal_sku: mapping.internalSku,
    supplier_sku: mapping.supplierSku,
    supplier_product_name: mapping.supplierProductName,
    min_order_qty: mapping.minOrderQty,
    mapping_status: mapping.mappingStatus,
  }));

  return {
    supplierId,
    supplierName: supplier.name,
    supplier_id: supplierId,
    supplier_name: supplier.name,
    items,
    message: "발주 초안이 생성되었습니다.",
  };
};