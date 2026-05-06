import * as supplierService from "../services/supplierService.js";

export const createSupplier = async (req, res) => {
  try {
    const result = await supplierService.createSupplier(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("[createSupplier] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 생성 실패",
    });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const result = await supplierService.getSuppliers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("[getSuppliers] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 목록 조회 실패",
    });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.getSupplierById(supplierId);

    if (!result) {
      return res.status(404).json({
        message: "공급처를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[getSupplierById] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 조회 실패",
    });
  }
};

export const updateSupplierById = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.updateSupplierById(supplierId, req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[updateSupplierById] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 수정 실패",
    });
  }
};

export const saveSupplierConnection = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    console.log("[saveSupplierConnection] params:", req.params);
    console.log("[saveSupplierConnection] body:", req.body);

    const result = await supplierService.saveSupplierConnection(
      supplierId,
      req.body?.configJson || {}
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("[saveSupplierConnection] error:", error);
    return res.status(500).json({
      message: error.message || "연결 설정 저장 실패",
    });
  }
};

export const getSupplierConnection = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.getSupplierConnection(supplierId);

    return res.status(200).json(result || null);
  } catch (error) {
    console.error("[getSupplierConnection] error:", error);
    return res.status(500).json({
      message: error.message || "연결 설정 조회 실패",
    });
  }
};

export const createSupplierProductMapping = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.createSupplierProductMapping(
      supplierId,
      req.body
    );

    return res.status(201).json(result);
  } catch (error) {
    console.error("[createSupplierProductMapping] error:", error);
    return res.status(500).json({
      message: error.message || "상품 매핑 저장 실패",
    });
  }
};

export const getSupplierProductMappings = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.getSupplierProductMappings(supplierId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[getSupplierProductMappings] error:", error);
    return res.status(500).json({
      message: error.message || "상품 매핑 조회 실패",
    });
  }
};

export const getRecommendedSuppliers = async (req, res) => {
  try {
    const variantId = Number(req.query.variantId);

    if (!Number.isFinite(variantId)) {
      return res.status(400).json({
        message: "variantId query parameter가 필요합니다.",
        status: "error",
      });
    }

    const result = await supplierService.getRecommendedSuppliersByVariantId(
      variantId
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("[getRecommendedSuppliers] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 추천 조회 실패",
      status: "error",
    });
  }
};

export const confirmSupplierMapping = async (req, res) => {
  try {
    const result = await supplierService.confirmSupplierMapping(req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[confirmSupplierMapping] error:", error);
    return res.status(500).json({
      message: error.message || "공급처 확정 실패",
      status: "error",
    });
  }
};

export const getConfirmedSupplierMappingByVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);

    if (!Number.isFinite(variantId)) {
      return res.status(400).json({
        message: "유효한 variantId가 필요합니다.",
        connected: false,
        mapping: null,
      });
    }

    const result = await supplierService.getConfirmedSupplierByVariantId(
      variantId
    );

    if (!result) {
      return res.status(200).json({
        connected: false,
        mapping: null,
      });
    }

    /**
     * service에서 이미 { connected, mapping } 형태로 반환하는 경우 그대로 반환
     */
    if (
      typeof result === "object" &&
      Object.prototype.hasOwnProperty.call(result, "connected")
    ) {
      return res.status(200).json(result);
    }

    /**
     * service에서 mapping row만 반환하는 경우 프론트가 쓰기 좋은 형태로 감싸서 반환
     */
    return res.status(200).json({
      connected: true,
      mapping: {
        ...result,

        // snake_case 호환 alias
        mapping_id: result.mappingId ?? result.id,
        supplier_id: result.supplierId,
        supplier_name: result.supplierName ?? result.name,
        shopify_variant_id: result.internalVariantId,
        internal_sku: result.internalSku,
        supplier_sku: result.supplierSku,
        supplier_product_name: result.supplierProductName,
        min_order_qty: result.minOrderQty,
        mapping_status: result.mappingStatus,
        order_method: result.source,
        match_score: result.confidenceScore,
      },
    });
  } catch (error) {
    console.error("[getConfirmedSupplierMappingByVariant] error:", error);
    return res.status(500).json({
      message: error.message || "자동 연결 조회 실패",
      connected: false,
      mapping: null,
    });
  }
};

export const createOrderDraft = async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({
        message: "유효한 supplier id가 필요합니다.",
      });
    }

    const result = await supplierService.createOrderDraft(supplierId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[createOrderDraft] error:", error);
    return res.status(500).json({
      message: error.message || "발주 초안 생성 실패",
    });
  }
};