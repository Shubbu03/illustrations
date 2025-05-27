import { Queue } from "bullmq";
import { redisOptions } from "./redisConnection";

export const chatQueue = new Queue("chatQueue", {
  connection: redisOptions,
});
