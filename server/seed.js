const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Expense = require("./models/Expense");
const Medicine = require("./models/Medicine");

const connectDB = require("./config/db");

const usersData = [
  { fullName: "System Admin", email: "admin@hms.com", password: "admin123", role: "admin", phone: "9876543210" },
  { fullName: "Dr. Aryan Mehta", email: "doctor@hms.com", password: "doctor123", role: "doctor", phone: "9123456789" },
  { fullName: "Suresh Raina", email: "patient@hms.com", password: "patient123", role: "patient", phone: "8765432109" },
  { fullName: "Priya Sharma", email: "reception@hms.com", password: "reception123", role: "reception", phone: "7654321098" },
];

const initialDoctors = [
  { name: 'Dr. Aryan Mehta', specialization: 'Cardiology', experience: '12 Years', availability: 'Mon, Wed, Fri (10AM–2PM)', contact: '+91 98765 43210', email: 'aryan@hms.com', status: 'Active', patients: 24 },
  { name: 'Dr. Sneha Verma', specialization: 'Neurology', experience: '8 Years', availability: 'Tue, Thu, Sat (9AM–1PM)', contact: '+91 87654 32109', email: 'sneha@hms.com', status: 'Active', patients: 18 },
  { name: 'Dr. Rahul Patil', specialization: 'Orthopedics', experience: '15 Years', availability: 'Mon–Fri (2PM–6PM)', contact: '+91 76543 21098', email: 'rahul@hms.com', status: 'On Leave', patients: 0 },
  { name: 'Dr. Nisha Iyer', specialization: 'Dermatology', experience: '5 Years', availability: 'Wed, Fri, Sun (11AM–4PM)', contact: '+91 65432 10987', email: 'nisha@hms.com', status: 'Active', patients: 12 },
];

const initialPatients = [
  { name: 'Suresh Raina', age: 34, gender: 'Male', contact: '8765432109', bloodGroup: 'B+', status: 'Active', address: 'Mumbai, MH', medicalHistory: 'Diabetes Type 2', height: 175, weight: 75 }, // Matched to seed user
  { name: 'Rohan Sharma', age: 34, gender: 'Male', contact: '9876543210', bloodGroup: 'B+', status: 'Active', address: 'Mumbai, MH', medicalHistory: 'Diabetes Type 2', height: 168, weight: 70 },
  { name: 'Priya Verma', age: 28, gender: 'Female', contact: '8765432109', bloodGroup: 'O+', status: 'Admitted', address: 'Pune, MH', medicalHistory: 'Asthma (mild)', height: 162, weight: 58 },
  { name: 'Amit Patel', age: 45, gender: 'Male', contact: '9123456789', bloodGroup: 'A+', status: 'Discharged', address: 'Ahmedabad, GJ', medicalHistory: 'Hypertension', height: 180, weight: 82 },
];

const initialAppointments = [
  { patient: 'Rohan Sharma', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-12', time: '10:30 AM', status: 'Pending', reason: 'Chest pain' },
  { patient: 'Priya Verma', doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: '2024-06-12', time: '11:15 AM', status: 'Confirmed', reason: 'Headache' },
  { patient: 'Vikram Singh', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-14', time: '09:00 AM', status: 'Confirmed', reason: 'Follow-up' },
];

const initialExpenses = [
  { item: 'MRI Machine', category: 'Machine', amount: 2500000, date: '2024-05-15' },
  { item: 'Surgical Tools Set', category: 'Equipment', amount: 85000, date: '2024-05-28' },
];

const initialMedicines = [
  { name: "Paracetamol", quantity: 150, price: 5 },
  { name: "Amoxicillin", quantity: 8, price: 45 },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log("🛠️ Starting Full Database Sync (Frontend → Backend)...");

    // Clean all collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Expense.deleteMany();
    await Medicine.deleteMany();

    console.log("🗑️ Cleared existing database records.");

    // 1. Seed Users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`✅ Seeded ${createdUsers.length} Base Users.`);

    // 2. Link Doctors
    const doctorUser = createdUsers.find(u => u.email === "doctor@hms.com");
    if (doctorUser) {
      const mainDoctor = initialDoctors.find(d => d.email === "aryan@hms.com");
      if (mainDoctor) mainDoctor.userId = doctorUser._id;
    }

    // 3. Link Patients
    const patientUser = createdUsers.find(u => u.email === "patient@hms.com");
    if (patientUser) {
      const mainPatient = initialPatients.find(p => p.contact === "8765432109"); // Suresh Raina
      if (mainPatient) mainPatient.userId = patientUser._id;
    }

    // 4. Insert Profiles
    await Doctor.insertMany(initialDoctors);
    console.log(`✅ Seeded ${initialDoctors.length} Doctors (linked to users).`);

    await Patient.insertMany(initialPatients);
    console.log(`✅ Seeded ${initialPatients.length} Patients (linked to users).`);

    // 5. Seed Others
    await Appointment.insertMany(initialAppointments);
    await Expense.insertMany(initialExpenses);
    await Medicine.insertMany(initialMedicines);

    console.log(`✅ Seeded remaining modules (Appointments, Expenses, Medicines).`);

    console.log("\n🎉 DATABASE SYNC COMPLETE! All users are now correctly linked to their profiles.\n");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
