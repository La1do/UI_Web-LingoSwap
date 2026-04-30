import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useApi } from "../../../hook/useApi";
import { useFriends, type Friend } from "../../../context/FriendContext";
import { chatService, type ChatMessage } from "../../../services/chat.service";
import { socketService } from "../../../services/socket.service";

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
  offsetIndex: number; // 0 = rightmost, 1 = second from right
}

export default function ChatWindow({ friend, onClose, offsetIndex }: ChatWindowProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateConversationId } = useFriends();
  const { execute: fetchMessages } = useApi<ChatMessage[]>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convIdRef = useRef<string | null>(friend.conversationId ?? null);

  // Fetch lịch sử tin nhắn
  useEffect(() => {
    if (!friend.conversationId) return;
    convIdRef.current = friend.conversationId;
    fetchMessages(chatService.getMessages(friend.conversationId)).then((data) => {
      if (data) setMessages(data);
    });
  }, [friend.conversationId]);

  // Scroll to bottom khi có tin mới
  useEffect(() => {
    if (!isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    const s = socketService.getSocket();
    if (!s) return;

    const handler = (msg: {
      _id: string;
      senderId: string;
      content: string;
      type: string;
      createdAt: string;
      conversationId: string;
    }) => {
      // Chỉ nhận tin nhắn từ friend này
      if (msg.senderId !== friend.id && msg.senderId !== user?.id) return;
      if (convIdRef.current && msg.conversationId !== convIdRef.current) return;

      const newMsg: ChatMessage = {
        _id: msg._id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        type: msg.type as "text" | "image",
        createdAt: msg.createdAt,
      };
      setMessages((prev) => {
        // Tránh duplicate
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, newMsg];
      });

      // Cập nhật conversationId nếu chưa có
      if (!convIdRef.current && msg.conversationId) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
    };

    s.on("receive_message", handler);
    s.on("message_sent_success", (msg: { _id: string; content: string; createdAt: string; conversationId?: string }) => {
      if (msg.conversationId && !convIdRef.current) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
    });

    return () => {
      s.off("receive_message", handler);
    };
  }, [friend.id, user?.id]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Optimistic UI
    const tempMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: convIdRef.current ?? "",
      senderId: user?.id ?? "",
      content: text,
      type: "text",
      createdAt: { full: "", friendly: "Vừa xong" },
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketService.sendMessage({
      partnerId: friend.id,
      content: text,
      matchSessionId: convIdRef.current ?? "",
    });
  }, [input, friend.id, user?.id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const tempMsg: ChatMessage = {
        _id: `temp-img-${Date.now()}`,
        conversationId: convIdRef.current ?? "",
        senderId: user?.id ?? "",
        content: base64,
        type: "image",
        createdAt: { full: "", friendly: "Vừa xong" },
      };
      setMessages((prev) => [...prev, tempMsg]);
      socketService.sendMessage({
        partnerId: friend.id,
        content: base64,
        matchSessionId: convIdRef.current ?? "",
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCall = () => {
    const params = new URLSearchParams({
      target: friend.id,
      name: friend.fullName,
      ...(friend.avatarUrl ? { avatar: friend.avatarUrl } : {}),
    });
    navigate(`/direct-call?${params.toString()}`);
  };

  const rightOffset = offsetIndex * 316 + 16;
  const validAvatar = friend.avatarUrl && friend.avatarUrl !== "default_avatar.png" ? friend.avatarUrl : undefined;

  return (
    <div
      className="fixed bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden min-h-100"
      style={{
        right: `${rightOffset}px`,
        width: "300px",
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
        borderBottom: "none",
        boxShadow: theme.shadow.card,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        style={{ background: theme.button.bg }}
        onClick={() => setIsMinimized((v) => !v)}
      >
        <div className="relative shrink-0">
          {validAvatar ? (
            <img src={validAvatar} alt={friend.fullName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: theme.button.bgHover, color: theme.button.text }}>
              {friend.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: theme.status[friend.status], borderColor: theme.button.bg }} />
        </div>

        <span className="flex-1 text-sm font-semibold truncate" style={{ color: theme.button.text }}>
          {friend.fullName}
        </span>

        {/* Call button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleCall(); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${theme.button.text}20`, color: theme.button.text }}
          title={t.chat.call}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${theme.button.text}20`, color: theme.button.text }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
            style={{ height: "320px", background: theme.background.page }}
          >
            {messages.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: theme.text.placeholder }}>
                {t.chat.noMessages}
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[75%] px-3 py-2 rounded-2xl text-sm"
                      style={{
                        background: isMe ? theme.button.bg : theme.background.card,
                        color: isMe ? theme.button.text : theme.text.primary,
                        borderBottomRightRadius: isMe ? "4px" : undefined,
                        borderBottomLeftRadius: !isMe ? "4px" : undefined,
                      }}
                    >
                      {msg.type === "image" ? (
                        <img src={msg.content} alt="img" className="max-w-full rounded-lg" />
                      ) : (
                        <span style={{ wordBreak: "break-word" }}>{msg.content}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderTop: `1px solid ${theme.border.default}`, background: theme.background.card }}
          >
            {/* Image button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
              style={{ background: theme.background.input, color: theme.text.secondary }}
              title={t.chat.sendImage}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t.chat.typeMessage}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: theme.text.primary }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 disabled:opacity-40"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
