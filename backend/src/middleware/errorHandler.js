/* eslint-disable no-unused-vars */
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  const status = Number(err.status || err.statusCode || 500);

  const message =
    status >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  if (env.nodeEnv !== "production") {
    // Keep server-side stack traces out of prod responses.
    console.error(err);
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    status,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? "INTERNAL" : "BAD_REQUEST"),
      message,
    },
  });
}
