import { Redis } from "ioredis";
import { env } from "../utils/env.js";

export const connection = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  maxRetriesPerRequest: null,
});
