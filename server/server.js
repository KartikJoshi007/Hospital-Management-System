const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Imports
const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");
const billingRoutes = require("./routes/billingRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const queueRoutes = require("./routes/queueRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const doctorEventRoutes = require("./routes/doctorEventRoutes");
const logRoutes = require("./routes/logRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bills", billingRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/records", require("./routes/medicalRecordRoutes"));
app.use("/api/schedule", require("./routes/scheduleRoutes"));

// New feature routes
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/doctor-events", doctorEventRoutes);
app.use("/api/logs", logRoutes);

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
