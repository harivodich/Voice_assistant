import { Router } from "express";
import { protectedRoute } from "../middleware/authMiddleware.js";
import {
  markReminderAsDone,
  findDueReminders,
} from "../repository/reminderRepository.js";

const router = Router();

/**
 * @swagger
 * /api/reminders/{id}/acknowledge:
 *   post:
 *     summary: Xác nhận đã nhận nhắc nhở
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhắc nhở
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reminder marked as done"
 *       404:
 *         description: Không tìm thấy nhắc nhở hoặc đã được xử lý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Reminder not found or already processed"
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

/**
 * @swagger
 * /api/reminders/due:
 *   get:
 *     summary: Lấy danh sách nhắc nhở đến hạn
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 */
router.get("/due", protectedRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    // Tìm các nhắc nhở đến hạn của riêng user này
    const reminders = await findDueReminders(userId, new Date());

    return res.json(reminders);
  } catch (error) {
    console.error("Error fetching due reminders:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// Mark reminder as done (acknowledge notification)
router.post("/:id/acknowledge", protectedRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await markReminderAsDone(userId, parseInt(id, 10));

    if (success) {
      return res.json({
        success: true,
        message: "Reminder marked as done",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Reminder not found or already processed",
      });
    }
  } catch (error) {
    console.error("Error acknowledging reminder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
