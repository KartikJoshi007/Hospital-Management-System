const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Imports
const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");
const billingRoutes = require("./routes/billingRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/bills", billingRoutes);
app.use("/api/medicines", medicineRoutes);

// Root/Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management API - Senior Grade Core 🚀",
  });
});

// Global Error Handler
app.use(errorHandler);

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
