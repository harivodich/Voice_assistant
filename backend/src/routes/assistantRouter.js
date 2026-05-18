import { Router } from "express";
import upload from "../middleware/uploadMiddleware.js";
import { speak, voiceChat, chat } from "../controllers/assistantController.js";

export const assistantRouter = Router();

/**
 * @swagger
 * /api/assistant/voice-chat:
 *   post:
 *     summary: Trò chuyện bằng giọng nói với trợ lý ảo
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: File audio chứa giọng nói của người dùng
 *     responses:
 *       200:
 *         description: Xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: File không hợp lệ hoặc thiếu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi xử lý audio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
assistantRouter.post("/voice-chat", upload.single("audio"), voiceChat);

/**
 * @swagger
 * /api/assistant/speak:
 *   post:
 *     summary: Chuyển văn bản thành giọng nói
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpeakRequest'
 *     responses:
 *       200:
 *         description: Tạo file audio thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audioUrl:
 *                   type: string
 *                   description: URL của file audio được tạo
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi tạo giọng nói
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

assistantRouter.route("/speak").get(speak).post(speak);

/**
 * @swagger
 * /api/assistant/chat:
 *   post:
 *     summary: Trò chuyện bằng văn bản với trợ lý ảo
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Trò chuyện thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi xử lý tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
assistantRouter.post("/chat", chat);
