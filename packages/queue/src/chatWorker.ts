import { Worker } from "bullmq";
import { redisOptions } from "./redisConnection";
import { prisma } from "@repo/db/prisma";

export const chatWorker = new Worker(
  "chatQueue",
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Job name:", job.name);

    try {
      const jobType = job.name || "unknown";

      if (jobType === "chat") {
        const { roomID, message, userID } = job.data;
        console.log("Processing chat creation");
        const dataInsert = await prisma.chat.create({
          data: { roomID: Number(roomID), message, userID },
        });
        console.log("Chat data inserted:", dataInsert);
      } else if (jobType === "erase_chat") {
        const { chatId, roomID, userID } = job.data;
        console.log("Processing chat deletion for ID:", chatId);
        const existingChat = await prisma.chat.findUnique({
          where: { id: Number(chatId) },
        });

        if (!existingChat) {
          console.log(
            "Chat with ID",
            chatId,
            "not found, possibly already deleted"
          );
          return;
        }

        console.log("Found chat to delete:", existingChat);

        const dataDeleted = await prisma.chat.delete({
          where: { id: Number(chatId) },
        });
        console.log("✅ Chat data deleted:", dataDeleted);
      } else {
        console.error("Unknown job type:", jobType);
      }
    } catch (error) {
      console.error("Job processing failed:", error);
      console.error("Job details:", {
        id: job.id,
        name: job.name,
        data: job.data,
      });
      throw error;
    }
  },
  { connection: redisOptions }
);

chatWorker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

chatWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
