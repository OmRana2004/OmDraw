"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

import Canvas from "@/components/canvas/Canvas";
import Toolbar from "@/components/canvas/Toolbar";
import Sidebar from "@/components/canvas/Sidebar";
import ShareModal from "@/components/ShareModal";

export default function CanvasPage() {
  const [tool, setTool] = useState("rectangle");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isGuestRoute = params.roomId === "guest";

    if (!token && !user?.isGuest && !isGuestRoute) {
      router.push("/signin");
    }
  }, []);

  return (
    <div className="w-screen h-screen">
      <Toolbar setTool={setTool} />

      <Canvas tool={tool} clearTrigger={clearTrigger} />

      {/* ✅ Pass onShare */}
      <Sidebar
        onClear={() => setClearTrigger((prev) => prev + 1)}
        onShare={() => {
          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user") || "{}");

          if (!token) {
            toast.error("Please login or signup to use collaboration");
            return;
          }
          setShowShareModal(true);
        }}
      />

      {/* Modal */}
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
