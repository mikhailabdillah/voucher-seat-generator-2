import { Router, type Router as ExpressRouter } from "express";
import {
  checkVoucherDuplicate,
  getVouchersList,
  getVoucherDetails,
  issueVoucher,
  removeVoucher,
} from "../controllers/voucherController.js";

export const voucherRouter: ExpressRouter = Router();

/**
 * @openapi
 * /api/check:
 *   get:
 *     summary: Check if a flight number and date already has an issued voucher
 *     tags:
 *       - Vouchers
 *     parameters:
 *       - in: query
 *         name: flight_number
 *         required: true
 *         schema:
 *           type: string
 *         example: GA-421
 *       - in: query
 *         name: flight_date
 *         required: true
 *         schema:
 *           type: string
 *         example: 2026-08-31
 *     responses:
 *       200:
 *         description: Check result
 *       400:
 *         description: Missing query parameters
 */
voucherRouter.get("/check", checkVoucherDuplicate);
voucherRouter.get("/vouchers/check", checkVoucherDuplicate); // Alias for compatibility

/**
 * @openapi
 * /api/generate:
 *   post:
 *     summary: Generate 3 random unique seats based on aircraft layout and issue a voucher
 *     tags:
 *       - Vouchers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVoucherInput'
 *     responses:
 *       201:
 *         description: Voucher issued successfully with 3 non-repeating seats
 *       409:
 *         description: Duplicate voucher for flight number on date
 *       422:
 *         description: Input validation error
 */
voucherRouter.post("/generate", issueVoucher);
voucherRouter.post("/vouchers", issueVoucher); // Alias for compatibility

/**
 * @openapi
 * /api/vouchers:
 *   get:
 *     summary: List all issued vouchers (with optional search filter)
 *     tags:
 *       - Vouchers
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching crew name, crew ID, or flight number
 *     responses:
 *       200:
 *         description: List of voucher records
 */
voucherRouter.get("/vouchers", getVouchersList);

/**
 * @openapi
 * /api/vouchers/{id}:
 *   get:
 *     summary: Get details of a specific voucher record
 *     tags:
 *       - Vouchers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Voucher details
 *       404:
 *         description: Voucher not found
 *   delete:
 *     summary: Delete a voucher record by ID
 *     tags:
 *       - Vouchers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Voucher deleted
 *       404:
 *         description: Voucher not found
 */
voucherRouter.get("/vouchers/:id", getVoucherDetails);
voucherRouter.delete("/vouchers/:id", removeVoucher);
