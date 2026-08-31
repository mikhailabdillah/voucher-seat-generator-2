#!/usr/bin/env node

import http from "http";
import { app } from "../src/app.js";
import { config } from "../src/config/env.js";
import { connectDB, disconnectDB } from "../src/config/database.js";

/** Normalize a port into a number, string, or false. */
function normalizePort(val: string | number): number | string | false {
  const port = parseInt(val as string, 10);
  if (isNaN(port)) return val; // named pipe
  if (port >= 0) return port; // port number
  return false;
}

const port = normalizePort(config.port || "4000");
app.set("port", port);

const server = http.createServer(app);

/** Event listener for HTTP server "error" event. */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") throw error;

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(`❌  ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`❌  ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/** Event listener for HTTP server "listening" event. */
function onListening(): void {
  const addr = server.address();
  const bind =
    typeof addr === "string" ? "pipe " + addr : `http://localhost:${addr?.port}`;
  console.log(`\n🛫  Voucher Seat API running at ${bind}`);
  console.log(`📚  Swagger Docs available at ${bind}/api-docs`);
  console.log(`⚙️   Environment: ${config.nodeEnv}\n`);
}

/** Graceful shutdown handler */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(async () => {
    console.log("🔒  HTTP server closed.");
    await disconnectDB();
    process.exit(0);
  });

  // Force close after 10s if stuck
  setTimeout(() => {
    console.error("❌  Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

/** Bootstrap Server */
async function startServer(): Promise<void> {
  try {
    await connectDB();
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (err) {
    console.error("❌  Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
