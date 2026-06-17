import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import router from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? ["https://campusbaba.onrender.com"] // Replace with your production domain
        : true, // Allow all origins in development
    credentials: true,
  }),
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1", router);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
