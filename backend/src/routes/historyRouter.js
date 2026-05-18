import { Router } from "express";
import { getHistory } from "../controllers/conversationController.js";

export const historyRouter = Router();

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Lấy lịch sử trò chuyện của người dùng
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
historyRouter.get("", getHistory);
