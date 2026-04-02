import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
  "http://localhost:5173",
  "http://localhost:3000",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedExactOrigins.includes(origin)) {
    return true;
  }

  // Vercel 프리뷰/배포 도메인 전체 허용
  if (origin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

app.use(
  cors({
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
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running" });
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