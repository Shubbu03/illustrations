import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

import dotenv from "dotenv";
import { chatQueue } from "@repo/queue";
import { prisma } from "@repo/db/prisma";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  userID: string;
}

interface User {
  ws: WebSocket;
  rooms: string[];
  userID: string;
}

function checkToken(token: string): string | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;
    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.id) {
      return null;
    }
    return decoded.id;
  } catch (error) {
    return null;
  }
}

const users: User[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
  ws.on("error", console.error);
  const url = request.url;
  if (!url) return;
  const queryParam = new URLSearchParams(url.split("?")[1]);
  const token = queryParam.get("token") || "";

  const userID = checkToken(token);
  if (!userID) {
    ws.close();
    return;
  }

  const user: User = {
    ws,
    rooms: [],
    userID,
  };

  users.push(user);

  ws.on("message", async (data) => {
    const parsed = JSON.parse(data.toString());
    switch (parsed.type) {
      case "join_room": {
        try {
          const slug = parsed.slug;
          const room = await prisma.room.findUnique({ where: { slug } });
          if (!room) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room does not exist." })
            );
            break;
          }

          user.rooms.push(room.id.toString());
          ws.send(JSON.stringify({ type: "joined_room", slug }));
        } catch (error) {
          console.error("Join room failed:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Failed to join room" })
          );
        }
        break;
      }

      case "leave_room": {
        try {
          const roomID = parsed.roomID;
          user.rooms = user.rooms.filter((r) => r !== roomID);

          ws.send(JSON.stringify({ type: "left_room", slug: parsed.slug }));
        } catch (error) {
          console.error("Leave room failed:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Failed to leave room" })
          );
        }
        break;
      }

      case "chat": {
        try {
          const { roomID, message } = parsed;

          await chatQueue.add("chat", { roomID, userID, message }); // first sending data to bullmq then broadcasting

          users.forEach((u) => {
            if (u.rooms.includes(roomID)) {
              u.ws.send(
                JSON.stringify({
                  type: "chat",
                  message,
                  roomID,
                  userID,
                })
              );
            }
          });
        } catch (error) {
          console.error("Chat message failed:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Failed to send chat message",
            })
          );
        }
        break;
      }

      default:
        ws.send(
          JSON.stringify({ type: "error", message: "Unknown message type" })
        );
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
