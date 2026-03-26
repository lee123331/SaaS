import * as syncService from "../services/syncService.js";

export const syncStore = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await syncService.syncStoreProducts(Number(id));

    res.json({
      success: true,
      ...result,
      message: "상품 sync가 완료되었습니다.",
    });
  } catch (error) {
    console.error("syncStore error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "상품 sync 중 오류가 발생했습니다.",
    });
  }
};