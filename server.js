console.log("=== NEW SERVER BUILD 2026-04-02 TEST ===");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

import productRoutes from "./routes/productRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const allowedExactOrigins = [
  "https://refundos01.vercel.app",
  "https://refundos32890.vercel.app",
  "https://re-fundos.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedExactOrigins.includes(origin)) {
    return true;
  }

  if (origin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.error("Blocked by CORS:", origin);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options("/auth/shopify", cors(corsOptions));
app.options("/store/oauth/callback", cors(corsOptions));
app.options("/store/:id/sync", cors(corsOptions));
app.options("/dashboard/metrics", cors(corsOptions));
app.options("/alerts", cors(corsOptions));
app.options("/products", cors(corsOptions));
app.options("/orders/approve", cors(corsOptions));

app.use(express.json());

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ||
  "https://animated-space-chainsaw-5gpq7w9g5gqj2vjwq-3000.app.github.dev";
const DEFAULT_FRONTEND_RETURN_URL =
  process.env.FRONTEND_REDIRECT_URL ||
  "https://re-fundos.vercel.app/dashboard.html";

const SHOPIFY_SCOPES =
  process.env.SHOPIFY_SCOPES ||
  "read_products,write_products,read_orders,write_orders,read_inventory,write_inventory";

const SHOPIFY_CALLBACK_URL = `${BACKEND_BASE_URL}/store/oauth/callback`;

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

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running", version: "test-2026-04-02" });
});

app.get("/auth/shopify", (req, res) => {
  try {
    const { shop, return_url } = req.query;

    if (!shop || !isValidShopDomain(shop)) {
      return res.status(400).json({ message: "유효한 shop parameter가 필요합니다." });
    }

    if (!SHOPIFY_API_KEY) {
      return res.status(500).json({ message: "SHOPIFY_API_KEY가 설정되지 않았습니다." });
    }

    const safeReturnUrl =
      return_url && isAllowedReturnUrl(return_url)
        ? return_url
        : DEFAULT_FRONTEND_RETURN_URL;

    const statePayload = {
      nonce: crypto.randomUUID(),
      return_url: safeReturnUrl,
    };

    const encodedState = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    const authUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${encodeURIComponent(SHOPIFY_API_KEY)}` +
      `&scope=${encodeURIComponent(SHOPIFY_SCOPES)}` +
      `&redirect_uri=${encodeURIComponent(SHOPIFY_CALLBACK_URL)}` +
      `&state=${encodeURIComponent(encodedState)}`;

    console.log("[/auth/shopify] redirect:", authUrl);

    return res.redirect(authUrl);
  } catch (error) {
    console.error("[/auth/shopify] error:", error);
    return res.status(500).json({
      message: "Shopify 인증 시작 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

app.use("/products", productRoutes);
app.use("/alerts", alertRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/store", storeRoutes);
app.use("/orders", orderRoutes);
app.use("/suppliers", supplierRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  return res.status(500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});