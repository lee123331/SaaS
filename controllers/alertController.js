import * as alertService from "../services/alertService.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getAlerts();
    res.json({ alerts });
  } catch (error) {
    console.error("getAlerts error:", error);
    res.status(500).json({ message: "알림 목록 조회 중 오류가 발생했습니다." });
  }
};