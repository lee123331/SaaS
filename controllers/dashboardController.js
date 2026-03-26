import * as dashboardService from "../services/dashboardService.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await dashboardService.getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("getDashboardMetrics error:", error);
    res.status(500).json({ message: "대시보드 지표 조회 중 오류가 발생했습니다." });
  }
};