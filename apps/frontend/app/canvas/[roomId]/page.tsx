"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Canvas from "@/components/canvas/Canvas";
import Toolbar from "@/components/canvas/Toolbar";
import Sidebar from "@/components/canvas/Sidebar";

export default function CanvasPage() {
  const [tool, setTool] = useState("rectangle");
  const [clearTrigger, setClearTrigger] = useState(0);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isGuestRoute = params.roomId === "guest"; //  IMPORTANT

    if (!token && !user?.isGuest && !isGuestRoute) {
      router.push("/signin");
    }
  }, []);

  return (
    <div className="w-screen h-screen">
      <Toolbar setTool={setTool} />

      <Canvas tool={tool} clearTrigger={clearTrigger} />

      <Sidebar onClear={() => setClearTrigger((prev) => prev + 1)} />
    </div>
  );
}