/** Xử lý action trả về từ backend assistant (mở web/app). */
export function runAssistantAction(action) {
  let a = action;
  while (a) {
    if (a.type === "open") {
      if (a.target === "web" && a.url) {
        window.open(a.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (a.target === "app" && a.deepLink) {
        window.location.href = a.deepLink;
        return;
      }
    }
    a = a.fallback;
  }
}
