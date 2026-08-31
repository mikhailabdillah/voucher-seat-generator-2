import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { aircraftRouter } from "./routes/aircraftRoutes.js";
import { voucherRouter } from "./routes/voucherRoutes.js";

export const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logger
if (config.nodeEnv !== "production") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Swagger API Documentation ────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    documentation: "/api-docs",
  });
});

app.use("/api/aircraft-types", aircraftRouter);
app.use("/api", voucherRouter); // Mounts /api/generate, /api/check, and /api/vouchers

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[SERVER ERROR]", err.message, err.stack);
  res.status(500).json({
    success: false,
    error:
      config.nodeEnv === "production"
        ? "Internal server error"
        : err.message,
  });
});
