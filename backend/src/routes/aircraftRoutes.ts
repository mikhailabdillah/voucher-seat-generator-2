import { Router, type Router as ExpressRouter } from "express";
import {
  getAircraftTypes,
  getAircraftSeatMap,
} from "../controllers/aircraftController.js";

export const aircraftRouter: ExpressRouter = Router();

/**
 * @openapi
 * /api/aircraft-types:
 *   get:
 *     summary: List all supported aircraft types and layouts
 *     tags:
 *       - Aircraft
 *     responses:
 *       200:
 *         description: List of aircraft configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AircraftConfig'
 */
aircraftRouter.get("/", getAircraftTypes);

/**
 * @openapi
 * /api/aircraft-types/{id}/seats:
 *   get:
 *     summary: Get complete seat map for a specific aircraft model
 *     tags:
 *       - Aircraft
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: B737-800
 *     responses:
 *       200:
 *         description: Full seat list
 *       404:
 *         description: Aircraft type not found
 */
aircraftRouter.get("/:id/seats", getAircraftSeatMap);
