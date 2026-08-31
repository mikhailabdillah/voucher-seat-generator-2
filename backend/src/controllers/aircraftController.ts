import type { Request, Response } from "express";
import {
  getAllAircraftConfigs,
  getAircraftConfig,
  generateSeatMap,
} from "../services/aircraftService.js";

export function getAircraftTypes(_req: Request, res: Response): void {
  const configs = getAllAircraftConfigs();
  res.json({ success: true, data: configs });
}

export function getAircraftSeatMap(req: Request, res: Response): void {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const config = getAircraftConfig(id);
  if (!config) {
    res.status(404).json({ success: false, error: "Aircraft type not found" });
    return;
  }
  const seats = generateSeatMap(config.id);
  res.json({ success: true, data: { aircraft_type: config.id, seats } });
}
