import { Draw } from "./Draw";

/**
 * Initializes the drawing canvas with WebSocket and room sync.
 * Delegates all drawing logic to the Draw class.
 */
export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  if (!canvas || !roomId || !socket) {
    console.error("initDraw: Missing required parameters.");
    return null;
  }

  try {
    const draw = new Draw(canvas, roomId, socket);

    // Optional: expose globally for debugging or tool control
    // @ts-ignore
    window.drawInstance = draw;

    return draw;
  } catch (error) {
    console.error("initDraw failed:", error);
    return null;
  }
}
