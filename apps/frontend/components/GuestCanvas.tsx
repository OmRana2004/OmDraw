"use client";

import { Canvas } from "./Canvas";

interface GuestCanvasProps {
  roomId: string;
}

/**
 * GuestCanvas loads the drawing canvas instantly.
 * No WebSocket. No authentication. Pure local drawing.
 */
export function GuestCanvas({ roomId }: GuestCanvasProps) {
  return (
    <div className="w-full h-full">
      <Canvas roomId={roomId} socket={null} guestMode={true} />
    </div>
  );
}
