import crypto from "crypto";
import * as storeService from "../services/storeService.js";

const DEFAULT_FRONTEND_RETURN_URL =
  process.env.FRONTEND_REDIRECT_URL ||
  "https://re-fundos.vercel.app/dashboard.html";

const ALLOWED_RETURN_URLS = [
  "https://re-fundos.vercel.app/dashboard.html",
  "https://refundos01.vercel.app/dashboard.html",
  "https://refundos32890.vercel.app/dashboard.html",
  "http://localhost:5173/dashboard.html",
  "http://localhost:3000/dashboard.html",
];

const isValidShopDomain = (shop) => {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
};

const isAllowedReturnUrl = (returnUrl) => {
  return ALLOWED_RETURN_URLS.includes(returnUrl);
};

const parseState = (state) => {
  try {
    if (!state) return null;
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

const verifyShopifyHmac = (req) => {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return false;

  const originalUrl = req.originalUrl || "";
  const queryString = originalUrl.split("?")[1] || "";
  if (!queryString) return false;

  const pairs = queryString.split("&").filter(Boolean);

  let hmac = null;
  const filtered = [];

  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    const key = eqIndex >= 0 ? pair.slice(0, eqIndex) : pair;
    const value = eqIndex >= 0 ? pair.slice(eqIndex + 1) : "";

    if (key === "hmac") {
      hmac = value;
      continue;
    }

    if (key === "signature") {
      continue;
    }

    filtered.push(`${key}=${value}`);
  }

  if (!hmac) return false;

  const message = filtered.sort().join("&");

  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac, "utf8"),
      Buffer.from(hmac, "utf8")
    );
  } catch {
    return false;
  }
};
export const handleStoreOptions = async (req, res) => {
  return res.sendStatus(204);
};

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
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    console.log("[oauthCallback] originalUrl:", req.originalUrl);
    console.log("[oauthCallback] method:", req.method);
    console.log("[oauthCallback] query:", req.query);
    console.log("[oauthCallback] body:", req.body);
console.log("[oauthCallback] secret exists:", !!process.env.SHOPIFY_API_SECRET);

    const shop = req.query.shop || req.body?.shop;
    const code = req.query.code || req.body?.code;
    const hmac = req.query.hmac || req.body?.hmac;
    const state = req.query.state || req.body?.state;

    if (!shop) {
      return res.status(400).json({ message: "shop 값이 없습니다." });
    }

    if (!isValidShopDomain(shop)) {
      return res.status(400).json({ message: "유효하지 않은 shop 도메인입니다." });
    }

    if (req.method === "GET" && code) {
      if (!hmac) {
        return res.status(400).json({ message: "hmac 값이 없습니다." });
      }

      if (!verifyShopifyHmac(req)) {
        return res.status(401).json({ message: "유효하지 않은 hmac입니다." });
      }

      const parsedState = parseState(state);
      const returnUrl =
        parsedState?.return_url && isAllowedReturnUrl(parsedState.return_url)
          ? parsedState.return_url
          : DEFAULT_FRONTEND_RETURN_URL;

      const store = await storeService.connectShopifyStoreByCode({
        shop,
        code,
      });

      const redirectUrl =
        `${returnUrl}` +
        `?shop=${encodeURIComponent(shop)}` +
        `&connected=1` +
        `&storeId=${encodeURIComponent(store.id)}`;

      console.log("[oauthCallback] redirectUrl:", redirectUrl);

      return res.redirect(redirectUrl);
    }

    const authHeader = req.headers.authorization || "";
    const sessionToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!sessionToken) {
      return res.status(401).json({ message: "sessionToken이 없습니다." });
    }

    const store = await storeService.connectShopifyStore({
      shop,
      sessionToken,
    });

    return res.status(200).json({
      message: "스토어 연결 완료",
      store,
    });
  } catch (error) {
    console.error("oauthCallback error:", error);
    return res.status(500).json({
      message: error.message || "OAuth 처리 실패",
    });
  }
};

export const syncStore = async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    const storeId = Number(req.params.id);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({ message: "유효한 store id가 아닙니다." });
    }

    const result = await storeService.syncStoreProducts(storeId);

    return res.status(200).json({
      message: "스토어 동기화 완료",
      ...result,
    });
  } catch (error) {
    console.error("syncStore error:", error);
    return res.status(500).json({
      message: error.message || "스토어 동기화 실패",
    });
  }
};
export const deleteStore = async (req, res) => {
  try {
    const storeId = Number(req.params.id);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({ message: "유효한 store id가 아닙니다." });
    }

    const result = await storeService.deleteStore(storeId);

    return res.status(200).json({
      message: "스토어 연결 해제 완료",
      ...result,
    });
  } catch (error) {
    console.error("deleteStore error:", error);
    return res.status(500).json({
      message: error.message || "스토어 연결 해제 실패",
    });
  }
};