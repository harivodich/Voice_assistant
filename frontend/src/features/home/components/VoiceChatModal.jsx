import { Mic, MicOff } from "lucide-react";

import aiAvatar from "../../../assets/ai.gif";
import userAvatar from "../../../assets/user.gif";

export function VoiceChatModal({
  avatarSrc,
  recording,
  speaking,
  busy,
  onToggleRecording,
  assistantLabel,
}) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-gradient-to-b from-[#0a1628] to-[#030a1a] rounded-3xl border border-white/10 shadow-2xl p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Trò chuyện giọng nói
          </h2>

          <p className="text-white/50">
            Giao tiếp trực tiếp với trợ lý AI bằng giọng nói
          </p>
        </div>

        {/* AVATARS */}
        <div className="flex items-center justify-center gap-16 mb-12">
          {/* USER */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
                relative w-36 h-36 rounded-full overflow-hidden
                transition-all duration-300 ring-4
                ${
                  recording
                    ? "ring-red-400 scale-110 shadow-[0_0_40px_rgba(248,113,113,0.5)]"
                    : "ring-white/10"
                }
              `}
            >
              <img
                src={userAvatar}
                alt="User"
                className="w-full h-full object-cover"
              />

              {recording && (
                <div className="absolute inset-0 border-4 border-red-400 rounded-full animate-ping" />
              )}
            </div>

            <div className="text-center">
              <div className="font-medium text-white">Bạn</div>

              {recording && (
                <div className="text-sm text-red-400 animate-pulse">
                  Đang nói...
                </div>
              )}
            </div>
          </div>

          {/* CENTER STATUS */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`
                w-4 h-4 rounded-full
                ${
                  speaking || recording
                    ? "bg-green-400 animate-pulse"
                    : "bg-white/20"
                }
              `}
            />

            <div className="text-xs uppercase tracking-widest text-white/40">
              LIVE
            </div>
          </div>

          {/* AI */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
                relative w-36 h-36 rounded-full overflow-hidden
                transition-all duration-300 ring-4
                ${
                  speaking
                    ? "ring-sky-400 scale-110 shadow-[0_0_40px_rgba(56,189,248,0.5)]"
                    : busy
                    ? "ring-yellow-400"
                    : "ring-white/10"
                }
              `}
            >
              <img
                src={speaking ? aiAvatar : avatarSrc}
                alt={assistantLabel}
                className="w-full h-full object-cover"
              />

              {speaking && (
                <div className="absolute inset-0 border-4 border-sky-400 rounded-full animate-ping" />
              )}
            </div>

            <div className="text-center">
              <div className="font-medium text-white">
                {assistantLabel}
              </div>

              {speaking && (
                <div className="text-sm text-sky-400 animate-pulse">
                  Đang trả lời...
                </div>
              )}

              {busy && !speaking && (
                <div className="text-sm text-yellow-400 animate-pulse">
                  Đang xử lý...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={onToggleRecording}
            disabled={busy}
            className={`
              w-28 h-28 rounded-full
              flex items-center justify-center
              transition-all duration-300
              ${
                recording
                  ? "bg-red-500 hover:bg-red-600 shadow-[0_0_50px_rgba(239,68,68,0.6)]"
                  : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:scale-105 shadow-[0_0_50px_rgba(59,130,246,0.5)]"
              }
              ${busy ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {recording ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        {/* FOOTER TEXT */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-base">
            {recording
              ? "Nhấn để dừng ghi âm"
              : busy
              ? "AI đang xử lý yêu cầu của bạn..."
              : "Nhấn microphone để bắt đầu trò chuyện"}
          </p>
        </div>
      </div>
    </div>
  );
}