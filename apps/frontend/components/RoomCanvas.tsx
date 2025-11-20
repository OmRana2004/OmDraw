"use client";

import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";
import { useEffect, useState, useRef } from "react";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connecting, setConnecting] = useState(true);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found! Please log in first.");
      setConnecting(false);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
      setConnecting(false);

      // Join the room
      ws.send(JSON.stringify({ type: "join_room", roomId }));
    };

    ws.onclose = (e) => {
      console.log("WebSocket closed:", e.reason || e.code);
      setSocket(null);
      setConnecting(true);

      // Try to reconnect after 1 second
      reconnectTimeout.current = setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };

    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [roomId]);

  if (connecting) {
    return <div>Connecting to server...</div>;
  }

  if (!socket) {
    return <div>Failed to connect to server.. Try to login again!</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}
