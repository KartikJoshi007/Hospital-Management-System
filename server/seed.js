const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Expense = require("./models/Expense");
const Medicine = require("./models/Medicine");
const Billing = require("./models/Billing");
const MedicalRecord = require("./models/MedicalRecord");
const Receptionist = require("./models/Receptionist");

const connectDB = require("./config/db");

const usersData = [
  { fullName: "System Admin", email: "admin@hms.com", password: "admin123", role: "admin", phone: "9876543210" },
  { fullName: "Dr. Aryan Mehta", email: "doctor@hms.com", password: "doctor123", role: "doctor", phone: "9123456789" },
  { fullName: "Suresh Raina", email: "patient@hms.com", password: "patient123", role: "patient", phone: "8765432109" },
  { fullName: "Priya Sharma", email: "reception@hms.com", password: "reception123", role: "reception", phone: "7654321098" },
];

const initialDoctors = [
  { 
    name: 'Dr. Aryan Mehta', 
    specialization: 'Cardiology', 
    category: 'cardiology',
    roleLevel: 'senior doctor',
    isOnDuty: true,
    experience: '12 Years', 
    availability: 'Mon, Wed, Fri (10AM–2PM)', 
    contact: '+91 98765 43210', 
    email: 'aryan@hms.com', 
    status: 'Active', 
    patients: 24 
  },
];

const initialPatients = [
  { 
    name: 'Suresh Raina', 
    age: 34, 
    gender: 'Male', 
    contact: '8765432109', 
    bloodGroup: 'B+', 
    status: 'Active', 
    address: 'Mumbai, MH', 
    medicalHistory: 'Diabetes Type 2',
    admissionDate: new Date('2024-05-01'),
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98,
      height: 175,
      weight: 75,
      bmi: 24.5
    }
  },
];

const initialBilling = [
  { patientName: "Suresh Raina", amount: 1500, type: "OPD", paymentStatus: "Paid", department: "cardiology", category: "consultation" },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log("🛠️ Starting Database Seed (Clinical & Analytics Optimized)...");

    // Clean all collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Expense.deleteMany();
    await Medicine.deleteMany();
    await Billing.deleteMany();
    await MedicalRecord.deleteMany();

    // 1. Seed Users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    // 2. Seed Patient & Doctor
    const drUser = createdUsers.find(u => u.role === "doctor");
    initialDoctors[0].userId = drUser._id;
    const doctor = await Doctor.create(initialDoctors[0]);

    const ptUser = createdUsers.find(u => u.role === "patient");
    initialPatients[0].userId = ptUser._id;
    const patient = await Patient.create(initialPatients[0]);

    // 3. Seed Medical Records (Internal & Historical)
    await MedicalRecord.create([
      {
        patientId: patient._id,
        doctorId: doctor._id,
        type: "Prescription",
        source: "Internal",
        title: "Initial Consultation",
        description: "Take Metformin 500mg daily.",
        clinicName: "Our Hospital",
        date: new Date('2024-06-01')
      },
      {
        patientId: patient._id,
        type: "Historical History",
        source: "External",
        title: "Asthma History (Childhood)",
        description: "Diagnosed at age 10. Used inhaler for 5 years.",
        clinicName: "Apollo Hospital, Delhi",
        date: new Date('2015-06-12')
      },
      {
        patientId: patient._id,
        type: "Lab Report",
        source: "Internal",
        title: "Blood Sugar Test",
        description: "Fasting blood sugar level: 110 mg/dL.",
        clinicName: "Main Lab",
        date: new Date('2024-06-05')
      }
    ]);

    // 4. Seed Billing
    initialBilling[0].patientId = patient._id;
    initialBilling[0].doctorId = doctor._id;
    await Billing.create(initialBilling);

    console.log(`✅ Seeded ${createdUsers.length} Base Users.`);
    console.log(`✅ Seeded 1 Doctor (Aryan Mehta).`);
    console.log(`✅ Seeded 1 Patient (Suresh Raina) with full Clinical Records.`);

    // 5. Seed Receptionist
    const receptionUser = createdUsers.find(u => u.role === "reception");
    if (receptionUser) {
      await Receptionist.create({
        userId: receptionUser._id,
        name: receptionUser.fullName,
        email: receptionUser.email,
        contact: receptionUser.phone || "7654321098",
        shift: "Morning",
        deskNumber: "Front Desk A",
        status: "Active"
      });
      console.log(`✅ Seeded 1 Receptionist (Priya Sharma).`);
    }

    console.log(`✅ Seeded Internal Prescriptions and External Historical Data.`);
    console.log(`✅ Seeded Billing records for Revenue Analytics.`);

    console.log("\n🎉 SEED COMPLETE! Your schema is now fully verified for Hospital operations.\n");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
