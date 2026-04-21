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

  if (!payload?.productId) {
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

  const product = await productModel.getProductByVariantId(Number(variantId));
  if (!product) {
    throw new Error("해당 variant 상품을 찾을 수 없습니다.");
  }

  const confirmed = await supplierModel.getConfirmedMappingByVariantId(
    Number(variantId)
  );

  if (confirmed) {
    return {
      variant_id: Number(variantId),
      internal_product_id: product.id,
      internal_sku: product.sku,
      auto_linked_supplier: {
        supplier_id: confirmed.supplierId,
        supplier_name: confirmed.supplierName,
        confidence_score: confirmed.confidenceScore ?? 100,
        source: confirmed.source ?? "confirmed",
        reason: confirmed.reason ?? "confirmed mapping exists",
        mapping_status: confirmed.mappingStatus,
      },
      recommendations: [],
      status: "ok",
    };
  }

  const poRecommendations =
    await supplierModel.getSupplierRecommendationByPurchaseHistory(product.id);

  const recommendations = poRecommendations.map((item) => ({
    supplier_id: item.supplierId,
    supplier_name: item.supplierName,
    confidence_score: 70,
    source: "po_history",
    reason: "matched by purchase order history",
    mapping_status: "suggested",
  }));

  return {
    variant_id: Number(variantId),
    internal_product_id: product.id,
    internal_sku: product.sku,
    auto_linked_supplier: null,
    recommendations,
    status: "ok",
  };
};

export const confirmSupplierMapping = async (payload) => {
  const {
    internal_product_id,
    internal_variant_id,
    internal_sku,
    supplier_id,
  } = payload;

  if (!internal_product_id || !internal_variant_id || !supplier_id) {
    throw new Error(
      "internal_product_id, internal_variant_id, supplier_id는 필수입니다."
    );
  }

  const supplier = await supplierModel.getSupplierBasicById(Number(supplier_id));
  if (!supplier) {
    throw new Error("존재하지 않는 공급처입니다.");
  }

  const result = await supplierModel.upsertConfirmedSupplierMapping({
    supplierId: Number(supplier_id),
    internalProductId: Number(internal_product_id),
    internalVariantId: Number(internal_variant_id),
    internalSku: internal_sku || null,
    productId: Number(internal_product_id),
    source: "manual",
    confidenceScore: 100,
    reason: "confirmed by user",
  });

  return {
    mapping_id: result.id,
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    mapping_status: "confirmed",
    message: "공급처가 확정되었습니다.",
  };
};

export const getConfirmedSupplierByVariantId = async (variantId) => {
  if (!variantId) {
    throw new Error("variantId가 필요합니다.");
  }

  const mapping = await supplierModel.getConfirmedMappingByVariantId(
    Number(variantId)
  );

  if (!mapping) {
    return null;
  }

  return {
    mapping_id: mapping.id,
    supplier_id: mapping.supplierId,
    supplier_name: mapping.supplierName,
    mapping_status: mapping.mappingStatus,
    confidence_score: mapping.confidenceScore,
    source: mapping.source,
    reason: mapping.reason,
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
  }));

  return {
    supplierId,
    supplierName: supplier.name,
    items,
    message: "발주 초안이 생성되었습니다.",
  };
};