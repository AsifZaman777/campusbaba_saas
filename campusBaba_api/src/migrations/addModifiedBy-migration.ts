import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI!;

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db!;

  // For any document that has modifiedBy set but is missing modifiedByModel,
  // default the model to "Employee" as a safety net.
  const result = await db
    .collection("notices")
    .updateMany(
      { modifiedBy: { $exists: true }, modifiedByModel: { $exists: false } },
      { $set: { modifiedByModel: "Employee" } },
    );

  console.log(
    `✅ Migration complete. Updated ${result.modifiedCount} notices with missing modifiedByModel.`,
  );

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
