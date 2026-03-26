import express from "express";
import productRoutes from "./routes/productRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
<<<<<<< HEAD
import storeRoutes from "./routes/storeRoutes.js";
=======
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running" });
});

app.use("/products", productRoutes);
app.use("/alerts", alertRoutes);
app.use("/dashboard", dashboardRoutes);
<<<<<<< HEAD
app.use("/store", storeRoutes);
=======
>>>>>>> e36f0c32fe54e1c0ad06b3ba1c04647171d56361

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});