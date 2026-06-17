import mongoose from "mongoose";
import seedDatabase from "../seed";

import { SuperAdmin } from "../masterModels/SuperAdmin";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/schooler";

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected successfully");

    // Auto-seed initial Super Admin
    try {
      const existingAdmin = await SuperAdmin.findOne({ email: "admin@campusbaba.com" });
      if (!existingAdmin) {
        await SuperAdmin.create({
          name: "Master Admin",
          email: "admin@campusbaba.com",
          password: "password123", // Pre-save hook hashes this
          isActive: true
        });
        console.log("✅ Initial Super Admin created: admin@campusbaba.com / password123");
      }
    } catch (err) {
      console.error("❌ Failed to seed Super Admin:", err);
    }



    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
