import { CgMenuRight } from "react-icons/cg";
import { FaUserAstronaut } from "react-icons/fa6";

export function HomeHeader({
  userName,
  avatarSrc,
  onOpenDrawer,
  onCustomize,
  onLogout,
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUserAstronaut className="w-5 h-5 text-sky-200" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white/60 leading-tight">Xin chào</p>
          <p className="font-semibold truncate">{userName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="hidden sm:inline-flex px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm border border-white/10"
          onClick={onCustomize}
        >
          Giao diện trợ lý
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-medium hover:bg-sky-100"
          onClick={onLogout}
        >
          Đăng xuất
        </button>
        <button
          type="button"
          className="sm:hidden p-2 rounded-xl bg-white/10"
          aria-label="Mở menu"
          onClick={onOpenDrawer}
        >
          <CgMenuRight className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
