import * as supplierService from "../services/supplierService.js";

export const createSupplier = async (req, res) => {
  try {
    const result = await supplierService.createSupplier(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("createSupplier error:", error);
    res.status(500).json({ message: error.message || "공급처 생성 실패" });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const result = await supplierService.getSuppliers();
    res.status(200).json(result);
  } catch (error) {
    console.error("getSuppliers error:", error);
    res.status(500).json({ message: error.message || "공급처 목록 조회 실패" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const result = await supplierService.getSupplierById(Number(req.params.id));

    if (!result) {
      return res.status(404).json({ message: "공급처를 찾을 수 없습니다." });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("getSupplierById error:", error);
    res.status(500).json({ message: error.message || "공급처 조회 실패" });
  }
};

export const updateSupplierById = async (req, res) => {
  try {
    const result = await supplierService.updateSupplierById(
      Number(req.params.id),
      req.body
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("updateSupplierById error:", error);
    res.status(500).json({ message: error.message || "공급처 수정 실패" });
  }
};

export const saveSupplierConnection = async (req, res) => {
  try {
    console.log("[supplierController.saveSupplierConnection] params:", req.params);
    console.log("[supplierController.saveSupplierConnection] body:", req.body);

    const result = await supplierService.saveSupplierConnection(
      Number(req.params.id),
      req.body?.configJson || {}
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("saveSupplierConnection error:", error);
    res.status(500).json({ message: error.message || "연결 설정 저장 실패" });
  }
};

export const getSupplierConnection = async (req, res) => {
  try {
    const result = await supplierService.getSupplierConnection(
      Number(req.params.id)
    );
    res.status(200).json(result || null);
  } catch (error) {
    console.error("getSupplierConnection error:", error);
    res.status(500).json({ message: error.message || "연결 설정 조회 실패" });
  }
};

export const createSupplierProductMapping = async (req, res) => {
  try {
    const result = await supplierService.createSupplierProductMapping(
      Number(req.params.id),
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    console.error("createSupplierProductMapping error:", error);
    res.status(500).json({ message: error.message || "상품 매핑 저장 실패" });
  }
};

export const getSupplierProductMappings = async (req, res) => {
  try {
    const result = await supplierService.getSupplierProductMappings(
      Number(req.params.id)
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("getSupplierProductMappings error:", error);
    res.status(500).json({ message: error.message || "상품 매핑 조회 실패" });
  }
};

export const createOrderDraft = async (req, res) => {
  try {
    const result = await supplierService.createOrderDraft(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    console.error("createOrderDraft error:", error);
    res.status(500).json({ message: error.message || "발주 초안 생성 실패" });
  }
};