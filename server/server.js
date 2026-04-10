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
const receptionistRoutes = require("./routes/receptionistRoutes");

const errorHandler = require("./middleware/errorMiddleware");
const cron = require("node-cron");
const Doctor = require("./models/Doctor");

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
app.use("/api/receptionists", receptionistRoutes);

// Root/Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management API - Senior Grade Core 🚀",
  });
});

// Global Error Handler
app.use(errorHandler);

// ── Auto-Off Cron: runs every minute, turns off doctors whose shift has ended ──
cron.schedule("* * * * *", async () => {
  try {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const now = new Date();
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (t) => {
      if (!t) return 0;
      const ampm = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (ampm) {
        let h = parseInt(ampm[1]), m = parseInt(ampm[2]);
        const p = ampm[3].toUpperCase();
        if (p === 'AM' && h === 12) h = 0;
        if (p === 'PM' && h !== 12) h += 12;
        return h * 60 + m;
      }
      const parts = t.split(':').map(Number);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const onDutyDoctors = await Doctor.find({ isOnDuty: true });
    for (const doc of onDutyDoctors) {
      if (!Array.isArray(doc.availability) || doc.availability.length === 0) continue;
      const inShift = doc.availability.some(slot => {
        if (!slot?.day || slot.day !== currentDay) return false;
        return currentTime >= parseTime(slot.startTime) && currentTime <= parseTime(slot.endTime);
      });
      if (!inShift) {
        doc.isOnDuty = false;
        doc.status = "Inactive";
        await doc.save({ validateBeforeSave: false });
      }
    }
  } catch (err) {
    console.error("Auto-off cron error:", err.message);
  }
});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
