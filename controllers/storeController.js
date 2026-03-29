import * as storeService from "../services/storeService.js";

export const createStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.body);

    res.status(201).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("createStore error:", error);
    res.status(500).json({
      success: false,
      message: "스토어 등록 중 오류가 발생했습니다.",
    });
  }
};

export const getStores = async (req, res) => {
  try {
    const stores = await storeService.getStores();

    res.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("getStores error:", error);
    res.status(500).json({
      success: false,
      message: "스토어 조회 중 오류가 발생했습니다.",
    });
  }
};

export const saveOAuthStore = async (req, res) => {
  try {
    const { shopName, shopDomain, accessToken } = req.body;

    if (!shopName || !shopDomain || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "shopName, shopDomain, accessToken은 필수입니다.",
      });
    }

    const store = await storeService.createStore({
      shopName,
      shopDomain,
      accessToken,
    });

    res.status(201).json({
      success: true,
      store,
      message: "OAuth 스토어 저장 완료",
    });
  } catch (error) {
    console.error("saveOAuthStore error:", error);
    res.status(500).json({
      success: false,
      message: "OAuth 스토어 저장 중 오류가 발생했습니다.",
    });
  }
};