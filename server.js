import express from "express";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running" });
});

app.use("/products", productRoutes);
app.use("/alerts", alertRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/store", storeRoutes);
app.use("/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});