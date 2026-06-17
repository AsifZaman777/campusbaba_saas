const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { SuperAdmin } = require("./dist/masterModels/SuperAdmin");

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/campusbaba");
    
    // Check if exists
    let admin = await SuperAdmin.findOne({ email: "admin@campusbaba.com" });
    if (!admin) {
      admin = await SuperAdmin.create({
        name: "Master Admin",
        email: "admin@campusbaba.com",
        password: "password123", // Will be hashed by pre-save hook
        isActive: true
      });
      console.log("Super Admin created successfully!");
    } else {
      console.log("Super Admin already exists.");
    }
    
    console.log("--- Credentials ---");
    console.log("Email: admin@campusbaba.com");
    console.log("Password: password123");
    console.log("-------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
