import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { AIRCRAFT_CONFIGS, type AircraftType } from "../aircraft/index.js";
import { pickRandomSeats } from "../services/seatService.js";
import {
  checkDuplicate,
  createVoucher,
  getAllVouchers,
  getVoucherById,
  searchVouchers,
  deleteVoucher,
} from "../db/voucherRepository.js";

export const voucherRouter: ExpressRouter = Router();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const aircraftTypeEnum = Object.keys(AIRCRAFT_CONFIGS) as [
  AircraftType,
  ...AircraftType[],
];

const CreateVoucherSchema = z.object({
  crew_name: z.string().min(2, "Crew name must be at least 2 characters"),
  crew_id: z.string().min(2, "Crew ID must be at least 2 characters"),
  flight_number: z
    .string()
    .min(2)
    .regex(/^[A-Z0-9\-]+$/, "Flight number must be uppercase alphanumeric"),
  flight_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Flight date must be in YYYY-MM-DD format"),
  aircraft_type: z.enum(aircraftTypeEnum),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/vouchers/check?flight_number=GA421&flight_date=2024-01-15
 * Check if a voucher already exists for this flight + date
 */
voucherRouter.get("/check", async (req, res) => {
  const { flight_number, flight_date } = req.query;

  if (
    typeof flight_number !== "string" ||
    typeof flight_date !== "string" ||
    !flight_number ||
    !flight_date
  ) {
    res.status(400).json({
      success: false,
      error: "Query params flight_number and flight_date are required",
    });
    return;
  }

  const existing = await checkDuplicate(flight_number, flight_date);
  res.json({
    success: true,
    data: {
      isDuplicate: !!existing,
      existingVoucher: existing ?? null,
    },
  });
});

/**
 * GET /api/vouchers — list all vouchers (with optional ?search=query)
 */
voucherRouter.get("/", async (req, res) => {
  const { search } = req.query;
  const vouchers =
    search && typeof search === "string" && search.trim()
      ? await searchVouchers(search.trim())
      : await getAllVouchers();
  res.json({ success: true, data: vouchers, count: vouchers.length });
});

/**
 * GET /api/vouchers/:id — get a single voucher by ID
 */
voucherRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid voucher ID" });
    return;
  }
  const voucher = await getVoucherById(id);
  if (!voucher) {
    res.status(404).json({ success: false, error: "Voucher not found" });
    return;
  }
  res.json({ success: true, data: voucher });
});

/**
 * POST /api/vouchers — generate 3 random seats and persist the voucher
 * Body: { crew_name, crew_id, flight_number, flight_date, aircraft_type }
 */
voucherRouter.post("/", async (req, res) => {
  // 1. Validate input
  const parsed = CreateVoucherSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { crew_name, crew_id, flight_number, flight_date, aircraft_type } =
    parsed.data;

  // 2. Check for duplicate (same flight + date) — pre-flight check for better UX
  const existing = await checkDuplicate(flight_number, flight_date);
  if (existing) {
    res.status(409).json({
      success: false,
      error: `Voucher already issued for flight ${flight_number} on ${flight_date}`,
      existingVoucher: existing,
    });
    return;
  }

  // 3. Generate 3 random unique seats via Fisher-Yates
  const selectedSeats = pickRandomSeats(aircraft_type, 3);
  const [s1, s2, s3] = selectedSeats;

  // 4. Persist to database via Prisma
  try {
    const voucher = await createVoucher({
      crew_name,
      crew_id,
      flight_number,
      flight_date,
      aircraft_type,
      seat1: s1.seat,
      seat2: s2.seat,
      seat3: s3.seat,
    });

    res.status(201).json({
      success: true,
      data: { voucher, seatDetails: selectedSeats },
    });
  } catch (err: any) {
    if (err?.code === "DUPLICATE_VOUCHER") {
      res.status(409).json({
        success: false,
        error: `Voucher already issued for flight ${flight_number} on ${flight_date}`,
      });
      return;
    }
    throw err;
  }
});

/**
 * DELETE /api/vouchers/:id — delete a voucher record
 */
voucherRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid voucher ID" });
    return;
  }
  const deleted = await deleteVoucher(id);
  if (!deleted) {
    res.status(404).json({ success: false, error: "Voucher not found" });
    return;
  }
  res.json({ success: true, message: `Voucher #${id} deleted` });
});
