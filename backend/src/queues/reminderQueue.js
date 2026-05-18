import { Queue } from "bullmq";
import { connection } from "../config/redis.js";
console.log(connection);
export const reminderQueue = new Queue("reminder", {
  connection,
});
