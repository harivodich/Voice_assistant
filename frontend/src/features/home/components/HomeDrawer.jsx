import { RxCross1 } from "react-icons/rx";

export function HomeDrawer({
  open,
  onClose,
  onCustomize,
  onLogout,
  history,
  assistantLabel,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity sm:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[min(100%,320px)] bg-[#0b1220] border-l border-white/10 p-5 flex flex-col gap-4 transition-transform sm:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          className="self-end p-2 rounded-lg bg-white/10"
          aria-label="Đóng"
          onClick={onClose}
        >
          <RxCross1 className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-full py-3 rounded-2xl bg-white/10 text-sm"
          onClick={() => {
            onClose();
            onCustomize();
          }}
        >
          Giao diện trợ lý
        </button>
        <button
          type="button"
          className="w-full py-3 rounded-2xl bg-white text-slate-900 text-sm font-medium"
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          Đăng xuất
        </button>
        <div className="border-t border-white/10 pt-4 flex-1 min-h-0 flex flex-col">
          <p className="text-xs uppercase tracking-wider text-white/45 mb-2">
            Lịch sử tin nhắn
          </p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-sm text-white/75">
            {history.length === 0 && (
              <p className="text-white/40">Chưa có hội thoại.</p>
            )}
            {history.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl px-3 py-2 ${
                  row.role === "user" ? "bg-sky-500/15" : "bg-white/5"
                }`}
              >
                <span className="text-[10px] uppercase text-white/40">
                  {row.role === "user" ? "Bạn" : assistantLabel}
                </span>
                <p className="whitespace-pre-wrap break-words">{row.content}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
