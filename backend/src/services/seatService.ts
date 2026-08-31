import {
  type AircraftType,
  generateSeatMap,
  getSeatPosition,
} from "./aircraftService.js";

export interface SelectedSeat {
  seat: string;
  row: number;
  column: string;
  position: "Window" | "Middle" | "Aisle";
}

/**
 * Picks `count` distinct seats at random from the aircraft's seat map
 * using Fisher-Yates partial shuffle (O(count) time, guaranteed no repeats).
 */
export function pickRandomSeats(
  aircraftType: AircraftType,
  count: number = 3
): SelectedSeat[] {
  const pool = generateSeatMap(aircraftType);

  if (count > pool.length) {
    throw new Error(
      `Cannot pick ${count} seats from a pool of ${pool.length} for ${aircraftType}`
    );
  }

  const arr = [...pool];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count).map((seat) => {
    const row = parseInt(seat.slice(0, -1), 10);
    const column = seat.slice(-1);
    return {
      seat,
      row,
      column,
      position: getSeatPosition(aircraftType, column),
    };
  });
}
