"use client";

export default function ShareModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1f1f27] text-white p-8 rounded-2xl w-100 text-center relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          Live collaboration
        </h2>

        <p className="text-gray-400 mb-6">
          Invite people to collaborate on your drawing.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Don't worry, the session is end-to-end encrypted and private.
        </p>

        <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-medium">
          ▶ Start session
        </button>
      </div>
    </div>
  );
}