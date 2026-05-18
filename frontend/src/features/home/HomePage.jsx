import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { useHomeAssistant } from "./useHomeAssistant";

import { HomeHeader } from "./components/HomeHeader";
import { HomeDrawer } from "./components/HomeDrawer";

import { ReminderBanner } from "./components/ReminderBanner";
import { ChatThread } from "./components/ChatThread";
import { ChatComposer } from "./components/ChatComposer";

import { VoiceChatModal } from "./components/VoiceChatModal";

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(true);

  const {
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
  } = useHomeAssistant();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#030a1a] via-[#0a1628] to-black text-white flex flex-col w-screen max-w-screen isolate">
      {/* HEADER */}
      <HomeHeader
        userName={userData?.name || userData?.profile?.name || userData?.username || "User"}
        avatarSrc={avatarSrc}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCustomize={() => navigate("/customize")}
        onLogout={handleLogout}
      />

      {/* DRAWER */}
      <HomeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCustomize={() => navigate("/customize")}
        onLogout={handleLogout}
        history={history}
        assistantLabel={assistantLabel}
      />

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden w-full min-w-0">
        {/* CENTER VOICE AREA */}
        <div className="flex-1 relative flex flex-col items-center justify-center px-4 sm:px-6 min-w-0 overflow-hidden">
          {/* Toggle chat button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            {chatOpen ? (
              <>
                <X className="w-4 h-4" />
                <span className="text-sm">Ẩn chat</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Mở chat</span>
              </>
            )}
          </button>

          {/* Reminder */}
          {reminderToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl">
              <ReminderBanner
                message={reminderToast.message}
                reminderId={reminderToast.reminderId}
                ackLoading={ackLoading}
                onAcknowledge={acknowledgeReminder}
                onDismiss={dismissReminder}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl">
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            </div>
          )}

          {/* HERO
          <div className="mb-8">
            <HomeHero
              assistantLabel={assistantLabel}
              avatarSrc={avatarSrc}
              recording={recording}
              speaking={speaking}
              busy={busy}
            />
          </div> */}

          {/* MAIN VOICE UI */}
          <VoiceChatModal
            avatarSrc={avatarSrc}
            recording={recording}
            speaking={speaking}
            busy={busy}
            onToggleRecording={toggleRecording}
            assistantLabel={assistantLabel}
          />
        </div>

        {/* RIGHT CHAT PANEL */}
        <div
          className={`
            transition-all duration-300 border-l border-white/10 bg-[#081120]
            flex flex-col overflow-hidden flex-shrink-0
            ${chatOpen ? "w-[280px] sm:w-[320px] md:w-[360px] opacity-100" : "w-0 opacity-0"}
          `}
        >
          {chatOpen && (
            <>
              {/* CHAT HEADER */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div>
                  <div className="font-semibold">Chat</div>
                  <div className="text-xs text-white/50">
                    Trò chuyện bằng văn bản
                  </div>
                </div>

                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* CHAT THREAD */}

              <ChatThread history={history} />

              {/* CHAT INPUT */}
              <div className="border-t border-white/10 p-3 shrink-0">
                <ChatComposer
                  input={input}
                  onInputChange={setInput}
                  busy={busy}
                  recording={recording}
                  onSend={() => {
                    if (!input.trim()) return;

                    sendText(input);
                    setInput("");
                  }}
                  onToggleRecord={toggleRecording}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
