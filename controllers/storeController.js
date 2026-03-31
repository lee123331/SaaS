import * as storeService from "../services/storeService.js";

export const createStore = async (req, res) => {
  try {
    const result = await storeService.createStore(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("createStore error:", error);
    res.status(500).json({ message: error.message || "스토어 생성 실패" });
  }
};

export const getStores = async (req, res) => {
  try {
    const result = await storeService.getStores();
    res.status(200).json(result);
  } catch (error) {
    console.error("getStores error:", error);
    res.status(500).json({ message: error.message || "스토어 목록 조회 실패" });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const result = await storeService.getStoreById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "스토어를 찾을 수 없습니다." });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("getStoreById error:", error);
    res.status(500).json({ message: error.message || "스토어 조회 실패" });
  }
};

export const oauthCallback = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const sessionToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const { shop } = req.body;

    const store = await storeService.connectShopifyStore({
      shop,
      sessionToken,
    });

    res.status(200).json({
      message: "스토어 연결 완료",
      store,
    });
  } catch (error) {
    console.error("oauthCallback error:", error);
    res.status(500).json({ message: error.message || "OAuth 처리 실패" });
  }
};

export const syncStore = async (req, res) => {
  try {
    const storeId = Number(req.params.id);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({ message: "유효한 store id가 아닙니다." });
    }

    const result = await storeService.syncStoreProducts(storeId);

    res.status(200).json({
      message: "스토어 동기화 완료",
      ...result,
    });
  } catch (error) {
    console.error("syncStore error:", error);
    res.status(500).json({ message: error.message || "스토어 동기화 실패" });
  }
};