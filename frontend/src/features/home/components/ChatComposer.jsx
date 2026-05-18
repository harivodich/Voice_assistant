import { FaMicrophone, FaStop } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";

export function ChatComposer({ input, onInputChange, busy, onSend }) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 flex gap-2 rounded-2xl border border-white/15 bg-black/30 p-1.5 pl-4 focus-within:ring-2 focus-within:ring-sky-500/40">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 py-2"
          placeholder="Nhập yêu cầu…"
          value={input}
          disabled={busy}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
      </div>
      <button
        type="button"
        className="w-11 h-11 shrink-0 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
        disabled={busy || !input.trim()}
        onClick={onSend}
      >
        <IoSend className="w-4 h-4" />
      </button>
    </div>
  );
}
