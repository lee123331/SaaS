import * as supplierModel from "../models/supplierModel.js";

export const createSupplier = async (payload) => {
  if (!payload?.name) {
    throw new Error("공급처명은 필수입니다.");
  }

  const result = await supplierModel.createSupplier(payload);
  return await supplierModel.getSupplierById(result.insertId);
};

export const getSuppliers = async () => {
  return await supplierModel.getSuppliers();
};

export const getSupplierById = async (id) => {
  return await supplierModel.getSupplierById(id);
};

export const updateSupplierById = async (id, payload) => {
  const existing = await supplierModel.getSupplierById(id);
  if (!existing) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  await supplierModel.updateSupplierById(id, payload);
  return await supplierModel.getSupplierById(id);
};

export const saveSupplierConnection = async (supplierId, configJson) => {
  console.log("[supplierService.saveSupplierConnection] supplierId:", supplierId);
  console.log("[supplierService.saveSupplierConnection] configJson:", configJson);

  const existing = await supplierModel.getSupplierById(supplierId);
  if (!existing) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  const normalizedConfig =
    configJson && typeof configJson === "object" ? configJson : {};

  await supplierModel.upsertSupplierConnection(supplierId, normalizedConfig);

  const savedConnection = await supplierModel.getSupplierConnection(supplierId);

  console.log(
    "[supplierService.saveSupplierConnection] savedConnection:",
    savedConnection
  );

  return savedConnection;
};

export const getSupplierConnection = async (supplierId) => {
  const existing = await supplierModel.getSupplierById(supplierId);
  if (!existing) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  return await supplierModel.getSupplierConnection(supplierId);
};

export const createSupplierProductMapping = async (supplierId, payload) => {
  const existing = await supplierModel.getSupplierById(supplierId);
  if (!existing) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  if (!payload?.productId) {
    throw new Error("productId는 필수입니다.");
  }

  const result = await supplierModel.createSupplierProductMapping({
    supplierId,
    ...payload,
  });

  const mappings = await supplierModel.getSupplierProductMappings(supplierId);

  return {
    insertId: result.insertId,
    mappings,
  };
};

export const getSupplierProductMappings = async (supplierId) => {
  const existing = await supplierModel.getSupplierById(supplierId);
  if (!existing) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  return await supplierModel.getSupplierProductMappings(supplierId);
};

export const createOrderDraft = async (supplierId) => {
  const supplier = await supplierModel.getSupplierById(supplierId);
  if (!supplier) {
    throw new Error("공급처를 찾을 수 없습니다.");
  }

  const mappings = await supplierModel.getSupplierProductMappings(supplierId);

  return {
    supplier: {
      id: supplier.id,
      name: supplier.name,
      integrationType: supplier.integrationType,
      contactEmail: supplier.contactEmail,
    },
    itemCount: mappings.length,
    items: mappings.map((item) => ({
      productId: item.productId,
      supplierSku: item.supplierSku,
      supplierProductName: item.supplierProductName,
      minOrderQty: item.minOrderQty,
      leadTimeDays: item.leadTimeDays,
    })),
    message: "발주 초안 생성 완료",
  };
};

const SupplierService = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplierById,
  saveSupplierConnection,
  getSupplierConnection,
  createSupplierProductMapping,
  getSupplierProductMappings,
  createOrderDraft,
};

export default SupplierService;