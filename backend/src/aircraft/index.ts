// Aircraft type identifiers supported by the system
export type AircraftType =
  | "B737-800"
  | "A320-200"
  | "B777-300ER"
  | "A350-900"
  | "ATR72-600"
  | "E190";

export interface AircraftConfig {
  id: AircraftType;
  name: string;
  manufacturer: string;
  category: "narrowbody" | "widebody" | "turboprop" | "regional";
  totalSeats: number;
  rows: number;
  /** Seat columns per group, e.g. [["A","B","C"],["D","E","F"]] */
  columnGroups: string[][];
  /** Row numbers that are exit rows (display info only) */
  exitRows: number[];
  description: string;
}

/**
 * All supported aircraft configurations.
 * Seat numbers are generated at runtime from rows × columnGroups.
 */
export const AIRCRAFT_CONFIGS: Record<AircraftType, AircraftConfig> = {
  "B737-800": {
    id: "B737-800",
    name: "Boeing 737-800",
    manufacturer: "Boeing",
    category: "narrowbody",
    totalSeats: 162,
    rows: 27,
    columnGroups: [["A", "B", "C"], ["D", "E", "F"]],
    exitRows: [12, 13],
    description: "Single-aisle narrow-body, 3-3 configuration (27 rows)",
  },
  "A320-200": {
    id: "A320-200",
    name: "Airbus A320-200",
    manufacturer: "Airbus",
    category: "narrowbody",
    totalSeats: 150,
    rows: 25,
    columnGroups: [["A", "B", "C"], ["D", "E", "F"]],
    exitRows: [12, 13],
    description: "Single-aisle narrow-body, 3-3 configuration (25 rows)",
  },
  "B777-300ER": {
    id: "B777-300ER",
    name: "Boeing 777-300ER",
    manufacturer: "Boeing",
    category: "widebody",
    totalSeats: 350,
    rows: 35,
    columnGroups: [["A", "B", "C"], ["D", "E", "F", "G"], ["H", "J", "K"]],
    exitRows: [16, 17],
    description: "Wide-body, 3-4-3 configuration (35 rows)",
  },
  "A350-900": {
    id: "A350-900",
    name: "Airbus A350-900",
    manufacturer: "Airbus",
    category: "widebody",
    totalSeats: 288,
    rows: 32,
    columnGroups: [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "K"]],
    exitRows: [15, 16],
    description: "Wide-body, 3-3-3 configuration (32 rows)",
  },
  "ATR72-600": {
    id: "ATR72-600",
    name: "ATR 72-600",
    manufacturer: "ATR",
    category: "turboprop",
    totalSeats: 70,
    rows: 18,
    columnGroups: [["A", "C"], ["D", "F"]],
    exitRows: [9],
    description: "Turboprop regional, 2-2 configuration (18 rows, skipping B/E)",
  },
  "E190": {
    id: "E190",
    name: "Embraer E190",
    manufacturer: "Embraer",
    category: "regional",
    totalSeats: 100,
    rows: 25,
    columnGroups: [["A", "B"], ["C", "D"]],
    exitRows: [12],
    description: "Regional jet, 2-2 configuration (25 rows)",
  },
};

/**
 * Generate the complete list of valid seat identifiers for an aircraft type.
 * e.g. ["1A","1B","1C","1D","1E","1F","2A", ...]
 */
export function generateSeatMap(aircraftType: AircraftType): string[] {
  const config = AIRCRAFT_CONFIGS[aircraftType];
  const seats: string[] = [];
  for (let row = 1; row <= config.rows; row++) {
    for (const group of config.columnGroups) {
      for (const col of group) {
        seats.push(`${row}${col}`);
      }
    }
  }
  return seats;
}

/**
 * Returns a human-readable position label for a seat column within a given aircraft.
 */
export function getSeatPosition(
  aircraftType: AircraftType,
  column: string
): "Window" | "Middle" | "Aisle" {
  const config = AIRCRAFT_CONFIGS[aircraftType];
  const allCols = config.columnGroups.flat();
  const groupSizes = config.columnGroups.map((g) => g.length);
  const col = column.toUpperCase();

  // Determine position within the whole row
  const posInGroup = (cols: string[]): "Window" | "Middle" | "Aisle" | null => {
    const idx = cols.indexOf(col);
    if (idx === -1) return null;
    if (idx === 0 || idx === cols.length - 1) return "Window";
    if (idx === 1 && cols.length >= 3) return "Middle";
    return "Aisle";
  };

  for (let g = 0; g < config.columnGroups.length; g++) {
    const group = config.columnGroups[g];
    const pos = posInGroup(group);
    if (pos !== null) {
      // Aisle seats: outermost columns of each group facing the aisle
      const isFirst = g > 0 && group.indexOf(col) === 0;
      const isLast = g < config.columnGroups.length - 1 && group.indexOf(col) === group.length - 1;
      if (isFirst || isLast) return "Aisle";
      return pos;
    }
  }
  return "Middle";
}
