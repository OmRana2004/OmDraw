"use client";

import { Button } from "@/components/ui/button";
import {
  Trash2,
  Users,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClearCanvas: () => void;
  onLiveCollab: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  onClearCanvas,
  onLiveCollab,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-2 top-22 bottom-48 w-56 backdrop-blur-2xl bg-[rgba(35,35,41,0.8)] border-r border-white/10",
        "transition-all duration-500 ease-[cubic-bezier(.25,.1,.25,1.0)] z-50 shadow-[8px_0_25px_-5px_rgba(0,0,0,0.4)]", "rounded-l-2xl","rounded-r-2xl",
        isOpen
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      )}
    >
      <div className="h-full flex flex-col justify- px-6">

        {/* Header */}
        <div className="mb-12 text-center select-none">
          <h2 className="text-2xl font-semibold text-white tracking-wide drop-shadow">
            Toools
          </h2>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded mt-3 inline-block text-neutral-300 border border-white/10">
            Ctrl+/
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          {/* Clear Canvas */}
          <button
            onClick={onClearCanvas}
            className="
              flex items-center gap-4 rounded-2xl
              text-neutral-200 transition-all duration-200
              hover:bg-white/10 hover:px-5 hover:py-3 hover:shadow-xl hover:shadow-black/30
              active:scale-95
            "
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-base font-medium">Clear Canvas</span>
          </button>

          {/* Live Collaboration */}
          <button
            onClick={onLiveCollab}
            className="
              flex items-center gap-4 rounded-2xl
              text-neutral-200 transition-all duration-200
              hover:bg-white/10 hover:px-5 hover:py-3 hover:shadow-xl hover:shadow-black/30
              active:scale-95
            "
          >
            <Users className="w-5 h-5" />
            <span className="text-base font-medium">Live Collaboration</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="
              flex items-center gap-4 rounded-2xl
              text-red-300 transition-all duration-200
              hover:bg-red-500/20 hover:px-5 hover:py-3 hover:shadow-xl hover:shadow-black/30
              active:scale-95
            "
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>

        {/* Theme Section */}
        <div className="mt-14 select-none">
          <h4 className="text-xs uppercase text-neutral-400 mb-3 ml-1 tracking-wider">
            Theme
          </h4>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl bg-transparent hover:bg-white/20 backdrop-blur-xl
              transition shadow-md hover:scale-105"
            >
              <Moon className="w-5 h-5 text-neutral-200" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl bg-transparent hover:bg-white/20 backdrop-blur-xl
              transition shadow-md hover:scale-105"
            >
              <Sun className="w-5 h-5 text-neutral-200" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl bg-transparent hover:bg-white/20 backdrop-blur-xl
              transition shadow-md hover:scale-105"
            >
              <Monitor className="w-5 h-5 text-neutral-200" />
            </Button>
          </div>
        </div>

      </div>
    </aside>
  );
}
