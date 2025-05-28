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

const activeUsers: Map<WebSocket, User> = new Map();
const roomSubscriptions: Map<string, Set<WebSocket>> = new Map();

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

  activeUsers.set(ws, user);

  ws.on("message", async (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data.toString());
    } catch (error) {
      console.error("Failed to parse message data:", error);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format." })
      );
      return;
    }

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

          const roomID = room.id.toString();
          user.rooms.push(roomID);

          if (!roomSubscriptions.has(roomID)) {
            roomSubscriptions.set(roomID, new Set());
          }
          roomSubscriptions.get(roomID)?.add(ws);

          ws.send(JSON.stringify({ type: "joined_room", slug, roomID }));
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
          roomSubscriptions.get(roomID)?.delete(ws);
          if (roomSubscriptions.get(roomID)?.size === 0) {
            roomSubscriptions.delete(roomID);
          }

          ws.send(
            JSON.stringify({ type: "left_room", slug: parsed.slug, roomID })
          );
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

          const subscribers = roomSubscriptions.get(roomID);
          if (subscribers) {
            subscribers.forEach((subscriberWs) => {
              if (subscriberWs.readyState === WebSocket.OPEN) {
                //sending message only if websocket is open
                subscriberWs.send(
                  JSON.stringify({
                    type: "chat",
                    message,
                    roomID,
                    userID,
                  })
                );
              }
            });
          }
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
    const user = activeUsers.get(ws);
    if (user) {
      user.rooms.forEach((roomID) => {
        const subscribers = roomSubscriptions.get(roomID);
        if (subscribers) {
          subscribers.delete(ws);
          if (subscribers.size === 0) {
            roomSubscriptions.delete(roomID);
          }
        }
      });
      activeUsers.delete(ws);
    }
  });
});
