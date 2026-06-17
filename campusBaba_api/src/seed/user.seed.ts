import { User } from "../models";

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      await User.create({
        email: "admin@campusbaba.com",
        password: "password123",
        role: "admin",
        // For admin, referenceId can be a placeholder or a new ObjectId
        referenceId: "60d21b4667d0d8992e610c8b", // Example ObjectId
        isActive: true,
      });
      console.log("✅ Default admin user created.");
    }
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
};

export default seedUsers;
