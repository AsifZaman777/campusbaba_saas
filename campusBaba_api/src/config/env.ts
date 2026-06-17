import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  PORT: z.string().default("5001"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/schooler"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    process.exit(1);
  }
};

export const env = parseEnv();
