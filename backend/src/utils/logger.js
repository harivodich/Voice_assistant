import pino from "pino";
import { env } from "./env.js";

let transport;

if (env.lokiUrl) {
  transport = pino.transport({
    target: "pino-loki",
    options: {
      host: env.lokiUrl,
      labels: {
        service: "voice-assistant-backend",
        environment: env.nodeEnv || "development",
      },
      batching: true,
      interval: 5,
    },
  });
}

export const logger = pino(
  {
    level: env.logLevel || "info",

    formatters: {
      level: (label) => ({
        level: label,
      }),
    },

    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export const createChildLogger = (context) => {
  return logger.child(context);
};

export const httpRequestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      "HTTP Request",
    );
  });

  next();
};
