import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import { userDataContext } from "../../context/userContext";
import { api, paths } from "../../services/http";
import { fileToDataUrl } from "../../lib/files";

export default function Customize2Page() {
  const { userData, backendImage, selectedImage, setUserData, normalizeUser } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistant_name || "",
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    setErr("");
    const name = assistantName.trim();
    if (!name) {
      setErr("Vui lòng nhập tên trợ lý.");
      return;
    }

    let assistantImage = null;
    if (backendImage) {
      try {
        assistantImage = await fileToDataUrl(backendImage);
      } catch {
        setErr("Không đọc được ảnh. Thử ảnh khác hoặc nhỏ hơn.");
        return;
      }
    } else if (selectedImage && selectedImage !== "input") {
      assistantImage = selectedImage;
    } else {
      setErr("Chọn một ảnh đại diện cho trợ lý.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.patch(paths.user.profile, {
        assistant_name: name,
        assistant_image: assistantImage,
      });
      // DEBUG: In ra để xem cấu trúc dữ liệu trả về từ backend
      console.log("API response data:", data);

      // Giả sử dữ liệu người dùng nằm trong `data.user`, hãy sửa lại cho đúng
      // Nếu dữ liệu nằm ngay ở `data` thì giữ nguyên là normalizeUser(data)
      setUserData(normalizeUser(data.user || data));
      navigate("/chat");
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Không lưu được. Kiểm tra kết nối backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-gradient-to-b from-[#030a1a] via-[#06122e] to-black flex justify-center items-center flex-col p-5 relative">
      <button
        type="button"
        className="absolute top-6 left-6 text-white/90 hover:text-white flex items-center gap-2 text-sm"
        onClick={() => navigate("/customize")}
      >
        <MdKeyboardBackspace className="w-6 h-6" />
        Quay lại
      </button>
      <h1 className="text-white mb-8 text-2xl sm:text-3xl text-center font-semibold">
        Đặt tên cho <span className="text-sky-300">trợ lý ảo</span>
      </h1>
      <p className="text-white/60 text-sm text-center max-w-md mb-6">
        Tên này giúp bạn gọi trợ lý trong hội thoại (ví dụ kích hoạt bằng giọng
        nói hoặc để hiển thị trên màn hình chính).
      </p>
      <input
        type="text"
        placeholder="Ví dụ: Mây, Sol, Linh…"
        className="w-full max-w-[600px] h-14 outline-none border-2 border-white/35 bg-white/5 text-white placeholder-white/45 px-5 rounded-2xl text-base"
        required
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
      />
      {err && (
        <p className="text-red-400 text-sm mt-4 text-center max-w-md">{err}</p>
      )}
      <button
        type="button"
        className="min-w-[280px] h-14 mt-8 text-slate-900 font-semibold bg-white rounded-full text-base hover:bg-sky-100 transition-colors disabled:opacity-60"
        disabled={loading || !assistantName.trim()}
        onClick={handleSave}
      >
        {loading ? "Đang lưu…" : "Hoàn tất & vào trợ lý"}
      </button>
    </div>
  );
}
