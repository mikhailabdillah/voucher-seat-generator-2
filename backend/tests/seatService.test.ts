import { describe, it, expect } from "vitest";
import { generateSeatMap, AIRCRAFT_CONFIGS } from "../src/services/aircraftService.js";
import { pickRandomSeats } from "../src/services/seatService.js";

describe("generateSeatMap", () => {
  it("generates the correct total seats for B737-800", () => {
    const seats = generateSeatMap("B737-800");
    expect(seats.length).toBe(AIRCRAFT_CONFIGS["B737-800"].totalSeats);
  });

  it("generates the correct total seats for A320-200", () => {
    const seats = generateSeatMap("A320-200");
    expect(seats.length).toBe(AIRCRAFT_CONFIGS["A320-200"].totalSeats);
  });

  it("generates the correct total seats for B777-300ER", () => {
    const seats = generateSeatMap("B777-300ER");
    expect(seats.length).toBe(AIRCRAFT_CONFIGS["B777-300ER"].totalSeats);
  });

  it("generates unique seat identifiers only", () => {
    for (const id of Object.keys(AIRCRAFT_CONFIGS)) {
      const seats = generateSeatMap(id as any);
      const unique = new Set(seats);
      expect(unique.size).toBe(seats.length);
    }
  });
});

describe("pickRandomSeats", () => {
  it("returns exactly 3 seats", () => {
    const seats = pickRandomSeats("B737-800", 3);
    expect(seats.length).toBe(3);
  });

  it("returns 3 distinct seat numbers", () => {
    const seats = pickRandomSeats("B737-800", 3);
    const ids = seats.map((s) => s.seat);
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });

  it("only picks valid seats from the seat map", () => {
    const pool = new Set(generateSeatMap("A320-200"));
    const seats = pickRandomSeats("A320-200", 3);
    for (const s of seats) {
      expect(pool.has(s.seat)).toBe(true);
    }
  });

  it("is non-repeating across 1000 runs", () => {
    for (let i = 0; i < 1000; i++) {
      const seats = pickRandomSeats("B737-800", 3);
      const ids = seats.map((s) => s.seat);
      const unique = new Set(ids);
      expect(unique.size).toBe(3);
    }
  });

  it("works for ATR72-600 with fewer seats", () => {
    const seats = pickRandomSeats("ATR72-600", 3);
    expect(seats.length).toBe(3);
    const unique = new Set(seats.map((s) => s.seat));
    expect(unique.size).toBe(3);
  });

  it("includes row, column and position metadata", () => {
    const seats = pickRandomSeats("B737-800", 3);
    for (const s of seats) {
      expect(s.row).toBeGreaterThan(0);
      expect(s.column).toMatch(/^[A-K]$/);
      expect(["Window", "Middle", "Aisle"]).toContain(s.position);
    }
  });
});
