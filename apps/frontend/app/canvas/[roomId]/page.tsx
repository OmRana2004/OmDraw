"use client";

import { useState } from "react";
import Canvas from "@/components/canvas/Canvas";
import Toolbar from "@/components/canvas/Toolbar";
import Sidebar from "@/components/canvas/Sidebar";

export default function CanvasPage() {
  const [tool, setTool] = useState("rectangle");
  const [clearTrigger, setClearTrigger] = useState(0); // ✅ add this

  return (
    <div className="w-screen h-screen">
      <Toolbar setTool={setTool} />

      {/* ✅ pass clearTrigger */}
      <Canvas tool={tool} clearTrigger={clearTrigger} />

      {/* ✅ pass onClear */}
      <Sidebar onClear={() => setClearTrigger(prev => prev + 1)} />
    </div>
  );
}