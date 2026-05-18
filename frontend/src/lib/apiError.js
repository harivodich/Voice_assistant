/** Chuẩn hóa message từ response backend (nhiều dạng: message, error string, error object). */
export function getApiErrorMessage(err, fallback = "Đã có lỗi xảy ra.") {
  const d = err?.response?.data;
  if (!d) {
    return err?.message && err.message !== "Network Error"
      ? err.message
      : fallback;
  }
  if (typeof d.message === "string") return d.message;
  if (typeof d.reply === "string") return d.reply;
  if (typeof d.error === "string") return d.error;
  if (d.error && typeof d.error.message === "string") return d.error.message;
  return fallback;
}
