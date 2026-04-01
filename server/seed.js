const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const users = [
  {
    fullName: "Super Admin",
    email: "admin@hms.com",
    password: "admin123",
    phone: "9000000001",
    role: "admin",
  },
  {
    fullName: "Dr. Aryan Mehta",
    email: "doctor@hms.com",
    password: "doctor123",
    phone: "9000000002",
    role: "doctor",
  },
  {
    fullName: "Rohan Sharma",
    email: "patient@hms.com",
    password: "patient123",
    phone: "9000000003",
    role: "patient",
  },
  {
    fullName: "Reception Staff",
    email: "reception@hms.com",
    password: "reception123",
    phone: "9000000004",
    role: "reception",
  },
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospitalDB";
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        await User.deleteOne({ email: u.email });
        console.log(`🗑  Removed existing: ${u.email}`);
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);

      await User.create({ ...u, password: hashed });
      console.log(`✅ Created [${u.role}] → ${u.email} / ${u.password}`);
    }

    console.log("\n🎉 Seed complete!\n");
    console.log("┌─────────────┬──────────────────────────┬──────────────────┐");
    console.log("│ Role        │ Email                    │ Password         │");
    console.log("├─────────────┼──────────────────────────┼──────────────────┤");
    console.log("│ admin       │ admin@hms.com            │ admin123         │");
    console.log("│ doctor      │ doctor@hms.com           │ doctor123        │");
    console.log("│ patient     │ patient@hms.com          │ patient123       │");
    console.log("│ reception   │ reception@hms.com        │ reception123     │");
    console.log("└─────────────┴──────────────────────────┴──────────────────┘");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
