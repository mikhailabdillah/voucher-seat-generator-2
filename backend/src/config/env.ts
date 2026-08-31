import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "file:../data/vouchers.db",
};
