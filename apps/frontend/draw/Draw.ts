import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "triangle"; x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "pencil"; startX: number; startY: number; endX: number; endY: number }
  | { type: "arrow"; startX: number; startY: number; endX: number; endY: number };

export class Draw {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private selectedTool: Tool = "pencil";
  private eraserRadius = 25;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.init();
    this.initHandlers();
    this.initInputHandlers();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  private async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  private initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.lineWidth = 2;

    this.existingShapes.forEach((shape) => {
      switch (shape.type) {
        case "rect":
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case "circle":
          this.ctx.beginPath();
          this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "triangle":
          this.ctx.beginPath();
          this.ctx.moveTo(shape.x1, shape.y1);
          this.ctx.lineTo(shape.x2, shape.y2);
          this.ctx.lineTo(shape.x3, shape.y3);
          this.ctx.closePath();
          this.ctx.stroke();
          break;
        case "pencil":
          this.ctx.beginPath();
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "arrow":
          this.drawArrow(shape.startX, shape.startY, shape.endX, shape.endY);
          break;
      }
    });
  }

  private drawArrow(x1: number, y1: number, x2: number, y2: number) {
    const headLength = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private isShapeHit(shape: Shape, x: number, y: number) {
    if (shape.type === "rect") {
      return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    } else if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    } else if (shape.type === "arrow" || shape.type === "pencil") {
      return this.pointToLineDistance(x, y, shape.startX, shape.startY, shape.endX, shape.endY) < this.eraserRadius;
    } else if (shape.type === "triangle") {
      const { x1, y1, x2, y2, x3, y3 } = shape;
      const area = Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2.0);
      const area1 = Math.abs((x*(y2-y3)+x2*(y3-y)+x3*(y-y2))/2.0);
      const area2 = Math.abs((x1*(y-y3)+x*(y3-y1)+x3*(y1-y))/2.0);
      const area3 = Math.abs((x1*(y2-y)+x2*(y-y1)+x*(y1-y2))/2.0);
      return Math.abs(area - (area1 + area2 + area3)) < 0.5;
    }
    return false;
  }

  private pointToLineDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A*C + B*D;
    const len_sq = C*C + D*D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param*C; yy = y1 + param*D; }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx*dx + dy*dy);
  }

  private eraseAt(x: number, y: number) {
    this.existingShapes = this.existingShapes.filter(shape => !this.isShapeHit(shape, x, y));
    this.clearCanvas();
  }

  private initInputHandlers() {
  const getPos = (e: MouseEvent | TouchEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e instanceof TouchEvent && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const start = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // critical for touch
    const pos = getPos(e);
    this.clicked = true;
    this.startX = pos.x;
    this.startY = pos.y;

    if (this.selectedTool === "pencil") {
      this.lastX = this.startX;
      this.lastY = this.startY;
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
    } else if (this.selectedTool === "eraser") {
      this.eraseAt(this.startX, this.startY);
    }
  };

    const move = (e: MouseEvent | TouchEvent) => {
    if (!this.clicked) return;
    e.preventDefault(); // critical for touch
    const pos = getPos(e);
    const currentX = pos.x;
    const currentY = pos.y;

      if (this.selectedTool === "pencil") {
        this.ctx.strokeStyle = "rgba(255,255,255)";
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();

        const shape: Shape = { type: "pencil", startX: this.lastX, startY: this.lastY, endX: currentX, endY: currentY };
        this.existingShapes.push(shape);
        this.lastX = currentX;
        this.lastY = currentY;
        return;
      }

      if (this.selectedTool === "eraser") {
        this.eraseAt(currentX, currentY);
        return;
      }

      // Live preview for shapes
      this.clearCanvas();
      const width = currentX - this.startX;
      const height = currentY - this.startY;

      switch(this.selectedTool) {
        case "square":
          this.ctx.strokeRect(this.startX, this.startY, width, height);
          break;
        case "circle":
          const centerX = this.startX + width/2;
          const centerY = this.startY + height/2;
          const radius = Math.sqrt(width*width + height*height)/2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "triangle":
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, currentY);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.lineTo(this.startX + width/2, this.startY);
          this.ctx.closePath();
          this.ctx.stroke();
          break;
        case "arrow":
          this.drawArrow(this.startX, this.startY, currentX, currentY);
          break;
      }
    };

    const end = (e: MouseEvent | TouchEvent) => {
      if (!this.clicked) return;
      this.clicked = false;

      if (this.selectedTool === "pencil" || this.selectedTool === "eraser") {
        this.ctx.closePath();
        return;
      }

      const pos = getPos(e);
      const endX = pos.x;
      const endY = pos.y;
      const width = endX - this.startX;
      const height = endY - this.startY;

      let shape: Shape | null = null;
      switch(this.selectedTool) {
        case "square":
          shape = { type: "rect", x: this.startX, y: this.startY, width, height };
          break;
        case "circle":
          const centerX = this.startX + width/2;
          const centerY = this.startY + height/2;
          const radius = Math.sqrt(width*width + height*height)/2;
          shape = { type: "circle", centerX, centerY, radius };
          break;
        case "triangle":
          shape = { type: "triangle", x1: this.startX, y1: endY, x2: endX, y2: endY, x3: this.startX + width/2, y3: this.startY };
          break;
        case "arrow":
          shape = { type: "arrow", startX: this.startX, startY: this.startY, endX, endY };
          break;
      }

      if (!shape) return;
      this.existingShapes.push(shape);

      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId }));
      }

      this.clearCanvas();
    };

    // Mouse
    this.canvas.addEventListener("mousedown", start);
  this.canvas.addEventListener("mousemove", move);
  this.canvas.addEventListener("mouseup", end);
  this.canvas.addEventListener("mouseleave", end);

  // Touch events
  this.canvas.addEventListener("touchstart", start, { passive: false });
  this.canvas.addEventListener("touchmove", move, { passive: false });
  this.canvas.addEventListener("touchend", end, { passive: false });
  this.canvas.addEventListener("touchcancel", end, { passive: false });
}
}