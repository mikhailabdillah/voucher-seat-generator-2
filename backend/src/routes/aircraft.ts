import { Router, type Router as ExpressRouter } from "express";
import { AIRCRAFT_CONFIGS, generateSeatMap } from "../aircraft/index.js";

export const aircraftRouter: ExpressRouter = Router();

/** GET /api/aircraft-types — list all supported aircraft with configs */
aircraftRouter.get("/", (_req, res) => {
  const configs = Object.values(AIRCRAFT_CONFIGS).map((cfg) => ({
    id: cfg.id,
    name: cfg.name,
    manufacturer: cfg.manufacturer,
    category: cfg.category,
    totalSeats: cfg.totalSeats,
    rows: cfg.rows,
    columnGroups: cfg.columnGroups,
    exitRows: cfg.exitRows,
    description: cfg.description,
  }));
  res.json({ success: true, data: configs });
});

/** GET /api/aircraft-types/:id/seats — get full seat map for an aircraft */
aircraftRouter.get("/:id/seats", (req, res) => {
  const id = req.params.id as keyof typeof AIRCRAFT_CONFIGS;
  if (!(id in AIRCRAFT_CONFIGS)) {
    res.status(404).json({ success: false, error: "Aircraft type not found" });
    return;
  }
  const seats = generateSeatMap(id);
  res.json({ success: true, data: { aircraft_type: id, seats } });
});
