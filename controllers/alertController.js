import * as alertModel from "../models/alertModel.js";
import * as inventoryService from "../services/inventoryService.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await alertModel.getAlerts();

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("getAlerts error:", error);
    res.status(500).json({
      success: false,
      message: "알림 조회 중 오류가 발생했습니다.",
    });
  }
};

export const generateAlerts = async (req, res) => {
  try {
    const result = await inventoryService.analyzeInventory();

    res.json({
      success: true,
      ...result,
      message: "재고 분석 및 알림 생성 완료",
    });
  } catch (error) {
    console.error("generateAlerts error:", error);
    res.status(500).json({
      success: false,
      message: "재고 분석 중 오류가 발생했습니다.",
    });
  }
};