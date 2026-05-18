import { useEffect, useRef } from "react";
import { api, paths } from "../../../services/http";

export function ReminderBanner({
  message,
  reminderId,
  ackLoading,
  onAcknowledge,
  onDismiss,
}) {
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!message?.trim()) return;

    stoppedRef.current = false;

    const speak = async () => {
      if (stoppedRef.current) return;

      try {
        // stop audio cũ
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const res = await api.post(
          paths.assistant.speak,
          { text: message },
          { responseType: "blob" },
        );

        const blob = res.data;
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
      }
    };

    speak();

    intervalRef.current = setInterval(() => {
      speak();
    }, 8000);

    return () => {
      stoppedRef.current = true;

      clearInterval(intervalRef.current);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [message]);

  const stop = () => {
    stoppedRef.current = true;

    clearInterval(intervalRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleDismiss = () => {
    stop();
    onDismiss?.();
  };

  const handleAcknowledge = () => {
    stop();
    onAcknowledge?.();
  };

  if (!message) return null;

  return (
    <div className="mb-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 backdrop-blur px-4 py-3 text-sm text-amber-50 flex items-center justify-between">
      {/* left content */}
      <div className="flex flex-col">
        <span className="font-medium">🔔 Nhắc việc</span>
        <span className="text-amber-100/80">{message}</span>
      </div>

      {/* actions */}
      <div className="flex gap-2">
        {reminderId != null && (
          <button
            disabled={ackLoading}
            onClick={handleAcknowledge}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300"
          >
            Đã nhận
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl bg-white/10 text-xs hover:bg-white/20"
        >
          Tắt
        </button>
      </div>
    </div>
  );
}
