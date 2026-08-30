import type { Voucher } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { prisma } from "./database.js";

export type { Voucher };

export interface CreateVoucherInput {
  crew_name: string;
  crew_id: string;
  flight_number: string;
  flight_date: string;
  aircraft_type: string;
  seat1: string;
  seat2: string;
  seat3: string;
}

// ─── Repository Functions ─────────────────────────────────────────────────────

/**
 * Check if a voucher already exists for this flight + date combination.
 */
export async function checkDuplicate(
  flightNumber: string,
  flightDate: string
): Promise<Voucher | null> {
  return prisma.voucher.findUnique({
    where: {
      flight_number_flight_date: {
        flight_number: flightNumber,
        flight_date: flightDate,
      },
    },
  });
}

/**
 * Insert a new voucher record.
 * Throws a structured error on unique constraint violation.
 */
export async function createVoucher(
  input: CreateVoucherInput
): Promise<Voucher> {
  try {
    return await prisma.voucher.create({
      data: {
        ...input,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
      err.code === "P2002" // Unique constraint failed
    ) {
      const conflict = new Error("DUPLICATE_VOUCHER");
      (conflict as any).code = "DUPLICATE_VOUCHER";
      throw conflict;
    }
    throw err;
  }
}

/**
 * Return all vouchers ordered by creation date descending.
 */
export async function getAllVouchers(): Promise<Voucher[]> {
  return prisma.voucher.findMany({
    orderBy: { created_at: "desc" },
  });
}

/**
 * Find a single voucher by primary key.
 */
export async function getVoucherById(id: number): Promise<Voucher | null> {
  return prisma.voucher.findUnique({ where: { id } });
}

/**
 * Full-text search across crew_name, crew_id, and flight_number.
 */
export async function searchVouchers(query: string): Promise<Voucher[]> {
  return prisma.voucher.findMany({
    where: {
      OR: [
        { crew_name: { contains: query } },
        { crew_id: { contains: query } },
        { flight_number: { contains: query } },
      ],
    },
    orderBy: { created_at: "desc" },
    take: 200,
  });
}

/**
 * Delete a voucher by id. Returns true if a row was deleted.
 */
export async function deleteVoucher(id: number): Promise<boolean> {
  try {
    await prisma.voucher.delete({ where: { id } });
    return true;
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
      err.code === "P2025" // Record not found
    ) {
      return false;
    }
    throw err;
  }
}
