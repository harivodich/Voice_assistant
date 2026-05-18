import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../../context/userContext";
import { api, paths } from "../../services/http";
import { useReminderSocket } from "../../hooks/useReminderSocket";
import { runAssistantAction } from "../../lib/assistant";
import { getApiErrorMessage } from "../../lib/apiError";

export function useHomeAssistant() {
  const { userData, logout } = useContext(userDataContext);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [reminderToast, setReminderToast] = useState(null);
  const [ackLoading, setAckLoading] = useState(false);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const stopRecording = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get(paths.history.list);
      const rows = data.history || [];
      setHistory(
        [...rows].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      );
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useReminderSocket(userData?.id, (payload) => {
    setReminderToast({
      message: payload?.message || "Bạn có nhắc nhở mới.",
      reminderId:
        payload?.reminderId != null ? Number(payload.reminderId) : null,
      ts: payload?.timestamp,
    });
  });

  const playReplyAudio = useCallback(async (text) => {
    if (!text?.trim()) return;
    setSpeaking(true);
    setError("");
    try {
      const res = await api.post(
        paths.assistant.speak,
        { text },
        { responseType: "blob" },
      );
      const blob = res.data;
      const ct = (res.headers["content-type"] || "").toLowerCase();
      if (ct.includes("application/json")) {
        const raw = await blob.text();
        let msg = "TTS thất bại.";
        try {
          const j = JSON.parse(raw);
          if (typeof j.error === "object" && j.error?.message) {
            msg = j.error.message;
          } else if (typeof j.error === "string") {
            msg = j.error;
          } else if (typeof j.message === "string") {
            msg = j.message;
          }
        } catch {
          /* ignore */
        }
        setSpeaking(false);
        setError(msg);
        return;
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      await audio.play();
    } catch (e) {
      setSpeaking(false);
      setError(
        getApiErrorMessage(e, "Không phát được âm thanh trả lời (TTS)."),
      );
    }
  }, []);

  const sendText = async (text) => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(paths.assistant.chat, { text: t });
      runAssistantAction(data.action);
      await loadHistory();
      await playReplyAudio(data.reply);
    } catch (e) {
      setError(getApiErrorMessage(e, "Không gửi được tin nhắn."));
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    if (recording || busy) return;
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 200) {
          setError("Bản ghi quá ngắn. Thử nói rõ hơn.");
          return;
        }
        setBusy(true);
        try {
          const form = new FormData();
          form.append("audio", blob, "recording.webm");
          const { data } = await api.post(paths.assistant.voiceChat, form);
          runAssistantAction(data.action);
          await loadHistory();
          await playReplyAudio(data.reply);
        } catch (e) {
          setError(getApiErrorMessage(e, "Không xử lý được giọng nói."));
        } finally {
          setBusy(false);
        }
      };
      rec.start(200);
      setRecording(true);
      stopRecording.current = () => {
        if (rec.state === "recording") rec.stop();
      };
    } catch {
      setError("Trình duyệt từ chối micro hoặc không hỗ trợ ghi âm.");
      setRecording(false);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording.current?.();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      stopRecording.current?.();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const assistantLabel = userData?.assistantName || "Trợ lý";
  const avatarSrc = userData?.assistantImage;

  const dismissReminder = () => setReminderToast(null);

  const acknowledgeReminder = async () => {
    const id = reminderToast?.reminderId;
    if (id == null) {
      dismissReminder();
      return;
    }
    setAckLoading(true);
    try {
      await api.post(paths.reminders.acknowledge(id));
    } catch {
      /* vẫn đóng banner */
    } finally {
      setAckLoading(false);
      dismissReminder();
    }
  };

  return {
    userData,
    logout,
    navigate,
    drawerOpen,
    setDrawerOpen,
    history,
    input,
    setInput,
    busy,
    recording,
    speaking,
    error,
    reminderToast,
    ackLoading,
    assistantLabel,
    avatarSrc,
    sendText,
    toggleRecording,
    dismissReminder,
    acknowledgeReminder,
  };
}
