import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./env.js";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Aero Voucher Seat Assignment API",
      version: "1.0.0",
      description:
        "Express.js REST API for airline promotional campaign voucher seat assignment with Prisma & SQLite persistence.",
      contact: {
        name: "Aero Promotional Crew Portal",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local Development Server",
      },
    ],
    components: {
      schemas: {
        Voucher: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            crew_name: { type: "string", example: "Captain Sarah Jenkins" },
            crew_id: { type: "string", example: "CRW-9821" },
            flight_number: { type: "string", example: "GA-421" },
            flight_date: { type: "string", example: "2026-08-31" },
            aircraft_type: { type: "string", example: "B737-800" },
            seat1: { type: "string", example: "12A" },
            seat2: { type: "string", example: "14C" },
            seat3: { type: "string", example: "22F" },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2026-08-31T09:00:00.000Z",
            },
          },
        },
        CreateVoucherInput: {
          type: "object",
          required: [
            "crew_name",
            "crew_id",
            "flight_number",
            "flight_date",
            "aircraft_type",
          ],
          properties: {
            crew_name: { type: "string", example: "Captain Sarah Jenkins" },
            crew_id: { type: "string", example: "CRW-9821" },
            flight_number: { type: "string", example: "GA-421" },
            flight_date: { type: "string", example: "2026-08-31" },
            aircraft_type: {
              type: "string",
              enum: [
                "B737-800",
                "A320-200",
                "B777-300ER",
                "A350-900",
                "ATR72-600",
                "E190",
              ],
              example: "B737-800",
            },
          },
        },
        AircraftConfig: {
          type: "object",
          properties: {
            id: { type: "string", example: "B737-800" },
            name: { type: "string", example: "Boeing 737-800" },
            manufacturer: { type: "string", example: "Boeing" },
            category: { type: "string", example: "narrowbody" },
            totalSeats: { type: "integer", example: 162 },
            rows: { type: "integer", example: 27 },
            columnGroups: {
              type: "array",
              items: {
                type: "array",
                items: { type: "string" },
              },
            },
            exitRows: {
              type: "array",
              items: { type: "integer" },
              example: [12, 13],
            },
            description: {
              type: "string",
              example: "Single-aisle narrow-body, 3-3 configuration (27 rows)",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
