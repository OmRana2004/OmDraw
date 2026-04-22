
import "dotenv/config";

// ✅ Debug once
console.log("JWT_SECRET:", process.env.JWT_SECRET);

import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import { WebSocketMessage, WsDataType } from "@repo/common";
import { JWT_SECRET } from "@repo/backend-common/config";

const PORT = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

type Connection = {
  id: string;
  userId: string;
  userName: string;
  ws: WebSocket;
  rooms: string[];
};

const connections: Connection[] = [];

/* ---------------- AUTH ---------------- */

function authenticate(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    console.log("🔥 DECODED:", decoded);

    if (!decoded || typeof decoded === "string") {
      return null;
    }

    return (
      decoded.id ||
      decoded.userId ||
      decoded.user?.id ||
      null
    );
  } catch (err) {
    console.log("JWT ERROR:", err);
    return null;
  }
}

/* ---------------- HELPERS ---------------- */

function broadcast(roomId: string, message: WebSocketMessage, exclude?: string) {
  connections.forEach((conn) => {
    if (conn.rooms.includes(roomId) && conn.id !== exclude) {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(JSON.stringify(message));
      }
    }
  });
}

function getParticipants(roomId: string) {
  const map = new Map();

  connections
    .filter((c) => c.rooms.includes(roomId))
    .forEach((c) => {
      map.set(c.userId, {
        userId: c.userId,
        userName: c.userName,
      });
    });

  return Array.from(map.values());
}

/* ---------------- CONNECTION ---------------- */

wss.on("connection", (ws, req) => {
  const url = req.url;

  if (!url) return;

  const params = new URLSearchParams(url.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    ws.close();
    return;
  }

  const userId = authenticate(token);

  if (!userId) {
    ws.close();
    return;
  }

  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const connection: Connection = {
    id: connectionId,
    userId,
    userName: userId,
    ws,
    rooms: [],
  };

  connections.push(connection);

  ws.send(
    JSON.stringify({
      type: WsDataType.CONNECTION_READY,
      connectionId,
    })
  );

  console.log("Connected:", connectionId);

  /* ---------------- MESSAGE HANDLING ---------------- */

  ws.on("message", async (data) => {
    try {
      const msg: WebSocketMessage = JSON.parse(data.toString());

      if (!msg.roomId) return;

      switch (msg.type) {

        /* -------- JOIN ROOM -------- */

       case WsDataType.JOIN: {

  // ✅ FIX: create room safely (no race condition)
  await prismaClient.room.upsert({
    where: { id: msg.roomId },
    update: {},
    create: {
      id: msg.roomId,
      slug: msg.roomId,
      admin: {
        connect: {
          id: connection.userId,
        },
      },
    },
  });

  if (!connection.rooms.includes(msg.roomId)) {
    connection.rooms.push(msg.roomId);
  }

  ws.send(
    JSON.stringify({
      type: WsDataType.USER_JOINED,
      roomId: msg.roomId,
      participants: getParticipants(msg.roomId),
    })
  );

  break;
}

        /* -------- LEAVE ROOM -------- */

        case WsDataType.LEAVE: {
          connection.rooms = connection.rooms.filter((r) => r !== msg.roomId);

          broadcast(
            msg.roomId,
            {
              type: WsDataType.USER_LEFT,
              roomId: msg.roomId,
              userId: connection.userId,
            } as any,
            connection.id
          );

          break;
        }

        /* -------- DRAW SHAPE -------- */

        case WsDataType.DRAW: {

  if (!msg.message || !msg.id) return;

  // ✅ Safety: ensure room exists
  const room = await prismaClient.room.findUnique({
    where: { id: msg.roomId },
  });

  if (!room) {
    console.log("Room missing, skipping DB save");
    return;
  }

  await prismaClient.chat.create({
    data: {
      roomId: msg.roomId,
      userId: connection.userId,
      message: JSON.stringify(msg.message),
    },
  });

  broadcast(msg.roomId, msg);

  break;
}

        /* -------- UPDATE SHAPE -------- */

        case WsDataType.UPDATE: {

          broadcast(msg.roomId, msg);

          break;
        }

        /* -------- ERASE SHAPE -------- */

        case WsDataType.ERASER: {

          broadcast(msg.roomId, msg);

          break;
        }

        /* -------- CURSOR MOVE -------- */

        case WsDataType.CURSOR_MOVE: {

          broadcast(msg.roomId, msg, connection.id);

          break;
        }

      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  /* ---------------- CLOSE ---------------- */

  ws.on("close", () => {

    const index = connections.findIndex((c) => c.id === connectionId);

    if (index !== -1) {
      connections.splice(index, 1);
    }

    console.log("Disconnected:", connectionId);
  });
});