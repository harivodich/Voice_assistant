import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import bg from "../../assets/authBg.png";
import { userDataContext } from "../../context/userContext";
import { api, paths, setStoredToken } from "../../services/http";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData, normalizeUser } = useContext(userDataContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post(paths.auth.register, {
        name,
        email,
        password,
      });
      setStoredToken(data.accessToken);
      setUserData(normalizeUser(data.user));
      setLoading(false);
      navigate("/customize");
    } catch (error) {
      setUserData(null);
      setLoading(false);
      setErr(
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div
      className="w-full min-h-[100dvh] bg-cover bg-center flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-full max-w-[500px] min-h-[600px] bg-[#00000072] backdrop-blur-md shadow-xl shadow-black/40 flex flex-col items-center justify-center gap-5 px-8 py-10 rounded-3xl border border-white/10"
        onSubmit={handleSignUp}
      >
        <h1 className="text-white text-2xl sm:text-3xl font-semibold text-center">
          Tạo tài khoản <span className="text-sky-300">Trợ lý giọng nói</span>
        </h1>
        <p className="text-white/70 text-sm text-center max-w-sm">
          Hệ thống yêu cầu: họ tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự.
        </p>

        <input
          type="text"
          placeholder="Họ và tên"
          className="w-full h-14 outline-none border-2 border-white/40 bg-white/5 text-white placeholder-white/50 px-5 rounded-2xl text-base"
          required
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full h-14 outline-none border-2 border-white/40 bg-white/5 text-white placeholder-white/50 px-5 rounded-2xl text-base"
          required
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className="w-full h-14 border-2 border-white/40 bg-white/5 text-white rounded-2xl text-base relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            className="w-full h-full rounded-2xl outline-none bg-transparent placeholder-white/50 px-5"
            required
            autoComplete="new-password"
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-4 text-white/80"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <IoEyeOff className="w-6 h-6" />
            ) : (
              <IoEye className="w-6 h-6" />
            )}
          </button>
        </div>
        {err.length > 0 && (
          <p className="text-red-400 text-sm w-full text-center">*{err}</p>
        )}
        <button
          type="submit"
          className="min-w-[180px] h-14 mt-2 text-slate-900 font-semibold bg-white rounded-full text-base hover:bg-sky-100 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Đang xử lý…" : "Đăng ký"}
        </button>

        <p className="text-white/90 text-sm">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="text-sky-300 hover:underline"
            onClick={() => navigate("/signin")}
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
}
