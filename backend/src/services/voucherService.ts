import { db, storage } from "../config/database.js";

export interface Voucher {
  id: number;
  crew_name: string;
  crew_id: string;
  flight_number: string;
  flight_date: string;
  aircraft_type: string;
  seat1: string;
  seat2: string;
  seat3: string;
  created_at: string;
}

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

/** Check if a voucher already exists for a flight + date pair using db0 */
export async function checkDuplicate(
  flightNumber: string,
  flightDate: string
): Promise<Voucher | null> {
  const stmt = db.prepare(
    "SELECT * FROM vouchers WHERE flight_number = ? AND flight_date = ?"
  );
  const row = (await stmt.get(flightNumber, flightDate)) as Voucher | undefined;
  return row ?? null;
}

/** Insert a new voucher record into SQLite via db0 & cache record key in unstorage */
export async function createVoucher(
  input: CreateVoucherInput
): Promise<Voucher> {
  const existing = await checkDuplicate(input.flight_number, input.flight_date);
  if (existing) {
    const conflict = new Error("DUPLICATE_VOUCHER");
    (conflict as any).code = "DUPLICATE_VOUCHER";
    throw conflict;
  }

  const now = new Date().toISOString();
  const stmtInsert = db.prepare(
    `INSERT INTO vouchers (crew_name, crew_id, flight_number, flight_date, aircraft_type, seat1, seat2, seat3, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  try {
    const result: any = await stmtInsert.run(
      input.crew_name,
      input.crew_id,
      input.flight_number,
      input.flight_date,
      input.aircraft_type,
      input.seat1,
      input.seat2,
      input.seat3,
      now
    );

    const lastId = result.lastInsertRowid ?? result.lastInsertrowid ?? result.insertId;
    let inserted: Voucher | undefined;
    
    if (lastId) {
      const insertedStmt = db.prepare("SELECT * FROM vouchers WHERE id = ?");
      inserted = (await insertedStmt.get(lastId)) as Voucher | undefined;
    }
    
    if (!inserted) {
      inserted = (await checkDuplicate(input.flight_number, input.flight_date)) ?? undefined;
    }

    if (!inserted) {
      throw new Error("Failed to retrieve newly created voucher");
    }

    // Unstorage key-value cache sync
    await storage.setItem(`voucher:${inserted.id}`, inserted);

    return inserted;
  } catch (err: any) {
    if (
      err?.message?.includes("UNIQUE constraint failed") ||
      err?.code === "SQLITE_CONSTRAINT"
    ) {
      const conflict = new Error("DUPLICATE_VOUCHER");
      (conflict as any).code = "DUPLICATE_VOUCHER";
      throw conflict;
    }
    throw err;
  }
}

/** Fetch all vouchers ordered by created_at descending via db0 */
export async function getAllVouchers(): Promise<Voucher[]> {
  const stmt = db.prepare("SELECT * FROM vouchers ORDER BY created_at DESC");
  const rows = (await stmt.all()) as Voucher[];
  return rows;
}

/** Get single voucher by ID via db0 / unstorage */
export async function getVoucherById(id: number): Promise<Voucher | null> {
  // Check unstorage cache first
  const cached = (await storage.getItem(`voucher:${id}`)) as Voucher | null;
  if (cached) return cached;

  const stmt = db.prepare("SELECT * FROM vouchers WHERE id = ?");
  const row = (await stmt.get(id)) as Voucher | undefined;
  if (row) {
    await storage.setItem(`voucher:${id}`, row);
  }
  return row ?? null;
}

/** Search vouchers across crew_name, crew_id, and flight_number via db0 */
export async function searchVouchers(query: string): Promise<Voucher[]> {
  const pattern = `%${query}%`;
  const stmt = db.prepare(
    `SELECT * FROM vouchers
     WHERE (crew_name LIKE ? OR crew_id LIKE ? OR flight_number LIKE ?)
     ORDER BY created_at DESC
     LIMIT 200`
  );
  const rows = (await stmt.all(pattern, pattern, pattern)) as Voucher[];
  return rows;
}

/** Delete a voucher by ID via db0 and remove from unstorage */
export async function deleteVoucher(id: number): Promise<boolean> {
  const stmt = db.prepare("DELETE FROM vouchers WHERE id = ?");
  const result: any = await stmt.run(id);
  const changes = result.changes ?? 0;

  if (changes > 0) {
    await storage.removeItem(`voucher:${id}`);
    return true;
  }
  return false;
}
