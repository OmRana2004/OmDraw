"use client";

import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Pencil,
  Square,
  ArrowRight,
  Eraser,
  Hand,
  Triangle,
  Menu,
} from "lucide-react";
import { Draw } from "@/draw/Draw";
import Sidebar from "@/components/Sidebar"; 
type CanvasProps = {
  roomId: string;
  socket: WebSocket;
};

export type Tool =
  | "pencil"
  | "square"
  | "triangle"
  | "circle"
  | "arrow"
  | "eraser"
  | "hand";

export function Canvas({ roomId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draw, setDraw] = useState<Draw>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Change tool inside draw class
  useEffect(() => {
    draw?.setTool(selectedTool);
  }, [selectedTool]);

  // Create drawing instance
  useEffect(() => {
    if (canvasRef.current) {
      const d = new Draw(canvasRef.current, roomId, socket);
      setDraw(d);

      const canvas = canvasRef.current;
      const preventScroll = (e: TouchEvent) => e.preventDefault();

      canvas.addEventListener("touchstart", preventScroll, { passive: false });
      canvas.addEventListener("touchmove", preventScroll, { passive: false });
      canvas.addEventListener("touchend", preventScroll, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", preventScroll);
        canvas.removeEventListener("touchmove", preventScroll);
        canvas.removeEventListener("touchend", preventScroll);
      };
    }
  }, [canvasRef]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute top-0 left-0 touch-none"
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClearCanvas={() => draw?.clearCanvas()}
        onLiveCollab={() => alert("Live collaboration coming soon")}
        onLogout={() => alert("Logout clicked")}
      />

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-5 left-5 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Tool Topbar */}
      <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}

// 🔥 Topbar (unchanged)
function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-lg transition-all duration-300">
        <ToolButton
          icon={<Pencil className="w-5 h-5" />}
          active={selectedTool === "pencil"}
          onClick={() => setSelectedTool("pencil")}
        />
        <ToolButton
          icon={<Square className="w-5 h-5" />}
          active={selectedTool === "square"}
          onClick={() => setSelectedTool("square")}
        />
        <ToolButton
          icon={<Triangle className="w-5 h-5" />}
          active={selectedTool === "triangle"}
          onClick={() => setSelectedTool("triangle")}
        />
        <ToolButton
          icon={<Circle className="w-5 h-5" />}
          active={selectedTool === "circle"}
          onClick={() => setSelectedTool("circle")}
        />
        <ToolButton
          icon={<ArrowRight className="w-5 h-5" />}
          active={selectedTool === "arrow"}
          onClick={() => setSelectedTool("arrow")}
        />
        <ToolButton
          icon={<Eraser className="w-5 h-5" />}
          active={selectedTool === "eraser"}
          onClick={() => setSelectedTool("eraser")}
        />
        <ToolButton
          icon={<Hand className="w-5 h-5" />}
          active={selectedTool === "hand"}
          onClick={() => setSelectedTool("hand")}
        />
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all duration-200 ${
        active
          ? "bg-white text-black shadow-md scale-105"
          : "text-white/80 hover:text-white hover:bg-white/20"
      }`}
    >
      {icon}
    </button>
  );
}
