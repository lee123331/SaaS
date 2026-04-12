console.log("[alertController] result:", result);

import * as alertService from "../services/alertService.js";

export const getAlerts = async (req, res) => {
  try {
    const result = await alertService.getAlerts();
    res.status(200).json(result);
  } catch (error) {
    console.error("getAlerts error:", error);
    res.status(500).json({ message: "알림 조회 중 오류가 발생했습니다." });
  }
};