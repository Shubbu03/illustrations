import { Worker } from "bullmq";
import { redisOptions } from "./redisConnection";
import { prisma } from "@repo/db/prisma";

export const chatWorker = new Worker(
  "chatQueue",
  async (job) => {
    const { roomID, message, userID } = job.data;
    console.log("📥 Processing job:", job.id);
    const dataInsert = await prisma.chat.create({
      data: { roomID: Number(roomID), message, userID },
    });
    console.log("✅ Data inserted:", dataInsert);
  },
  { connection: redisOptions }
);

chatWorker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

chatWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
