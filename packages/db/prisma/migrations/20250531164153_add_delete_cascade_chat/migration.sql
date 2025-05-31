-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomID_fkey";

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomID_fkey" FOREIGN KEY ("roomID") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
