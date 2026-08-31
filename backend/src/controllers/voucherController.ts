import type { Request, Response } from "express";
import { z } from "zod";
import { AIRCRAFT_CONFIGS, type AircraftType } from "../services/aircraftService.js";
import { pickRandomSeats } from "../services/seatService.js";
import {
  checkDuplicate,
  createVoucher,
  getAllVouchers,
  getVoucherById,
  searchVouchers,
  deleteVoucher,
} from "../services/voucherService.js";

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

export async function checkVoucherDuplicate(
  req: Request,
  res: Response
): Promise<void> {
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
}

export async function getVouchersList(
  req: Request,
  res: Response
): Promise<void> {
  const { search } = req.query;
  const vouchers =
    search && typeof search === "string" && search.trim()
      ? await searchVouchers(search.trim())
      : await getAllVouchers();
  res.json({ success: true, data: vouchers, count: vouchers.length });
}

export async function getVoucherDetails(
  req: Request,
  res: Response
): Promise<void> {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
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
}

export async function issueVoucher(
  req: Request,
  res: Response
): Promise<void> {
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

  const existing = await checkDuplicate(flight_number, flight_date);
  if (existing) {
    res.status(409).json({
      success: false,
      error: `Voucher already issued for flight ${flight_number} on ${flight_date}`,
      existingVoucher: existing,
    });
    return;
  }

  const selectedSeats = pickRandomSeats(aircraft_type, 3);
  const [s1, s2, s3] = selectedSeats;

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
}

export async function removeVoucher(
  req: Request,
  res: Response
): Promise<void> {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
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
}
