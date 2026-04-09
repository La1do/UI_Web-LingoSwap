// ChatPanel.tsx — Khung chat trong cuộc gọi
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

interface Message {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
}

const now = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default function ChatPanel() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "them", text: "Xin chào! Bạn có nghe thấy tôi không?", time: "08:00" },
    { id: 2, sender: "me",   text: "Có, nghe rõ rồi!", time: "08:01" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: "me", text, time: now() }]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-sm font-semibold flex items-center gap-2"
        style={{
          borderBottom: `1px solid ${theme.border.default}`,
          color: theme.text.primary,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"
          style={{ color: theme.text.accent }}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${msg.sender === "me" ? "self-end items-end" : "self-start items-start"}`}
          >
            <div
              className="px-3 py-2 rounded-2xl text-sm"
              style={{
                background: msg.sender === "me" ? theme.button.bg : theme.background.input,
                color: msg.sender === "me" ? theme.button.text : theme.text.primary,
                borderRadius: msg.sender === "me" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
              }}
            >
              {msg.text}
            </div>
            <span className="text-[10px] mt-0.5 px-1" style={{ color: theme.text.placeholder }}>
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{ borderTop: `1px solid ${theme.border.default}` }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
          style={{
            background: theme.background.input,
            color: theme.text.primary,
            border: `1px solid ${theme.border.default}`,
            transition: "border 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
          onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity"
          style={{
            background: input.trim() ? theme.button.bg : theme.button.bgDisabled,
            color: theme.button.text,
          }}
          aria-label="Gửi"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
