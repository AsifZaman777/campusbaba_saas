import mongoose from "mongoose";
import seedDatabase from "../seed";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/schooler";

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected successfully");

    // Seed the database
    if (process.env.NODE_ENV !== "production") {
      await seedDatabase();
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
