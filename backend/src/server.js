import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDb } from "./config/db.js";
import cors from "cors";
import { env } from "./utils/env.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import { authRouter } from "./routes/authRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import { assistantRouter } from "./routes/assistantRouter.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import { initializeSocketHandlers } from "./socket/index.js";
import { historyRouter } from "./routes/historyRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./workers/reminderWorker.js";
import {
  register,
  requestMetricsMiddleware,
  activeConnections,
  socketConnections,
} from "./utils/metrics.js";
import { logger, httpRequestLogger } from "./utils/logger.js";
process.env.TZ = "Asia/Ho_Chi_Minh";

const app = express();
const server = createServer(app);

/** CORS: `origin: true` phản chiếu Origin khi env là * — tránh lỗi trình duyệt với credentials. */
const corsOriginOption =
  !env.corsOrigin || env.corsOrigin === "*" ? true : env.corsOrigin;

const io = new Server(server, {
  cors: {
    origin: corsOriginOption,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = env.port;

// middlewares
app.use(helmet());
app.use(httpRequestLogger);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use(cors({ origin: corsOriginOption, credentials: true }));
app.use(requestMetricsMiddleware);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái sức khỏe của server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "voice-assistant-backend",
    time: new Date().toISOString(),
  });
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Voice Assistant Backend API Documentation",
  }),
);

app.use("/api/auth", authRouter);

app.use("/api", protectedRoute);

app.use("/api/assistant", assistantRouter);
app.use("/api/reminders", reminderRoutes);
app.use("/api/history", historyRouter);
app.use("/api/user", userRouter);
app.use(errorHandler);

connectDb().then(() => {
  // Initialize Socket.IO handlers
  initializeSocketHandlers(io);

  server.listen(PORT, () => {
    logger.info(`Server bắt đầu trên cổng ${PORT}`);
    logger.info(`Socket.IO server is running`);
    logger.info(`Reminder worker is running`);
  });
});
