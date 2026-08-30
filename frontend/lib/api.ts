const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface AircraftConfig {
  id: string;
  name: string;
  manufacturer: string;
  category: "narrowbody" | "widebody" | "turboprop" | "regional";
  totalSeats: number;
  rows: number;
  columnGroups: string[][];
  exitRows: number[];
  description: string;
}

export interface SelectedSeat {
  seat: string;
  row: number;
  column: string;
  position: "Window" | "Middle" | "Aisle";
}

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
}

/**
 * Fetch available aircraft types and layouts
 */
export async function getAircraftTypes(): Promise<AircraftConfig[]> {
  const res = await fetch(`${API_BASE_URL}/aircraft-types`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch aircraft types");
  const json = await res.json();
  return json.data;
}

/**
 * Check if flight + date already has an issued voucher
 */
export async function checkDuplicateVoucher(
  flightNumber: string,
  flightDate: string
): Promise<{ isDuplicate: boolean; existingVoucher: Voucher | null }> {
  if (!flightNumber || !flightDate) return { isDuplicate: false, existingVoucher: null };
  const res = await fetch(
    `${API_BASE_URL}/vouchers/check?flight_number=${encodeURIComponent(
      flightNumber
    )}&flight_date=${encodeURIComponent(flightDate)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to check duplicate flight");
  const json = await res.json();
  return json.data;
}

/**
 * Generate 3 non-repeating seats and save voucher to database
 */
export async function createVoucher(
  input: CreateVoucherInput
): Promise<{ voucher: Voucher; seatDetails: SelectedSeat[] }> {
  const res = await fetch(`${API_BASE_URL}/vouchers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error || "Failed to create voucher";
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.details = json.details;
    err.existingVoucher = json.existingVoucher;
    throw err;
  }
  return json.data;
}

/**
 * Fetch all issued vouchers (with optional search query)
 */
export async function getVouchers(search?: string): Promise<Voucher[]> {
  const url = search
    ? `${API_BASE_URL}/vouchers?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/vouchers`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vouchers");
  const json = await res.json();
  return json.data;
}

/**
 * Delete a voucher record
 */
export async function deleteVoucher(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete voucher");
  const json = await res.json();
  return json.success;
}
