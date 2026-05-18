import { useEffect, useRef } from "react";

export function ChatThread({ history }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history]);

  return (
    <div
      className="
        flex-1
        min-h-0
        overflow-y-auto
        overflow-x-hidden
        p-4
        pr-2
        space-y-4

        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-white/5
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-sky-500/40
        transition-all
      "
    >
      {history.length === 0 && (
        <p className="text-center text-white/40 text-sm py-12">
          Bắt đầu bằng một câu chào hoặc yêu cầu thử ví dụ: “Hôm nay thứ mấy?”
          hoặc “Mở YouTube”.
        </p>
      )}

      {history.map((row) => (
        <div
          key={row.id}
          className={`flex ${
            row.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`
              max-w-[85%]
              rounded-2xl
              px-4
              py-2.5
              text-sm
              leading-relaxed
              break-words
              whitespace-pre-wrap
              ${
                row.role === "user"
                  ? "bg-sky-600 text-white"
                  : "bg-white/10 text-white/90"
              }
            `}
          >
            {row.content}
          </div>
        </div>
      ))}

      {/* auto scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
