import { Queue } from "bullmq";
import { connection } from "./redis.js";
console.log(connection);
export const reminderQueue = new Queue("reminder", {
  connection,
});
