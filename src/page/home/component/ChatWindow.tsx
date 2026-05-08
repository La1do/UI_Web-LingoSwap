import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useApi } from "../../../hook/useApi";
import { useFriends, type Friend } from "../../../context/FriendContext";
import { chatService, type ChatMessage, type UploadImageResponse } from "../../../services/chat.service";
import { socketService } from "../../../services/socket.service";

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
  offsetIndex: number;
}

// ─── Status indicator (chỉ cho image) ────────────────────────

function ImageStatus({ status, onRetry }: { status?: ChatMessage["status"]; onRetry?: () => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();

  if (!status || status === "sent") return null;

  if (status === "sending") {
    return (
      <p className="text-[10px] mt-0.5 text-right" style={{ color: theme.text.placeholder }}>
        {t.chat.sending}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 mt-0.5">
      <p className="text-[10px]" style={{ color: theme.text.error }}>{t.chat.failed}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-[10px] underline hover:opacity-70"
          style={{ color: theme.text.error }}>
          · {t.chat.retry}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function ChatWindow({ friend, onClose, offsetIndex }: ChatWindowProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateConversationId } = useFriends();
  const { execute: fetchMessages } = useApi<ChatMessage[]>();
  const { execute: uploadImageExec } = useApi<UploadImageResponse>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convIdRef = useRef<string | null>(friend.conversationId ?? null);

  useEffect(() => {
    if (!friend.conversationId) return;
    convIdRef.current = friend.conversationId;
    fetchMessages(chatService.getMessages(friend.conversationId)).then((data) => {
      if (data) setMessages(data);
    });
  }, [friend.conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const s = socketService.getSocket();
    if (!s) return;

    const handler = (msg: {
      _id: string; senderId: string; content: string;
      type: string; createdAt: string; conversationId: string;
    }) => {
      if (msg.senderId !== friend.id && msg.senderId !== user?.id) return;
      if (convIdRef.current && msg.conversationId !== convIdRef.current) return;

      const newMsg: ChatMessage = {
        _id: msg._id, conversationId: msg.conversationId,
        senderId: msg.senderId, content: msg.content,
        type: msg.type as "text" | "image", createdAt: msg.createdAt,
      };
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, newMsg];
      });

      if (!convIdRef.current && msg.conversationId) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
    };

    const sentHandler = (msg: { conversationId?: string }) => {
      if (msg.conversationId && !convIdRef.current) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
    };

    s.on("receive_message", handler);
    s.on("message_sent_success", sentHandler);
    return () => {
      s.off("receive_message", handler);
      s.off("message_sent_success", sentHandler);
    };
  }, [friend.id, user?.id]);

  // Text: gửi qua socket — check connected trước
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const socket = socketService.getSocket();
    const isConnected = socket?.connected ?? false;

    setInput("");

    const tempMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: convIdRef.current ?? "",
      senderId: user?.id ?? "",
      content: text,
      type: "text",
      createdAt: { full: "", friendly: "" },
      // Text không có status — socket là instant, không cần loading
    };
    setMessages((prev) => [...prev, tempMsg]);

    if (!isConnected) {
      // Socket không connected → failed ngay
      setMessages((prev) =>
        prev.map((m) => m._id === tempMsg._id ? { ...m, status: "failed" as const } : m)
      );
      return;
    }

    socketService.sendMessage({ partnerId: friend.id, content: text, matchSessionId: null });
  }, [input, friend.id, user?.id]);

  const handleRetryText = useCallback((msg: ChatMessage) => {
    const socket = socketService.getSocket();
    if (!socket?.connected) return;

    setMessages((prev) => prev.filter((m) => m._id !== msg._id));
    const retryMsg: ChatMessage = {
      ...msg,
      _id: `temp-${Date.now()}`,
      status: undefined,
    };
    setMessages((prev) => [...prev, retryMsg]);
    socketService.sendMessage({ partnerId: friend.id, content: msg.content, matchSessionId: null });
  }, [friend.id]);

  // Image: gửi qua API — có loading/success/failed
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const tempId = `temp-img-${Date.now()}`;
      const tempMsg: ChatMessage = {
        _id: tempId,
        conversationId: convIdRef.current ?? "",
        senderId: user?.id ?? "",
        content: base64,
        type: "image",
        createdAt: { full: "", friendly: "" },
        status: "sending",
      };
      setMessages((prev) => [...prev, tempMsg]);

      uploadImageExec(chatService.uploadImage(file, friend.id, null)).then((res) => {
        if (res) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId
                ? { ...m, _id: res._id, content: res.content, conversationId: res.conversationId, status: "sent" }
                : m
            )
          );
          if (!convIdRef.current && res.conversationId) {
            convIdRef.current = res.conversationId;
            updateConversationId(friend.id, res.conversationId);
          }
        } else {
          setMessages((prev) =>
            prev.map((m) => m._id === tempId ? { ...m, status: "failed" } : m)
          );
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCall = () => {
    const params = new URLSearchParams({
      target: friend.id, name: friend.fullName,
      ...(friend.avatarUrl ? { avatar: friend.avatarUrl } : {}),
    });
    navigate(`/direct-call?${params.toString()}`);
  };

  const rightOffset = offsetIndex * 316 + 16;
  const validAvatar = friend.avatarUrl && friend.avatarUrl !== "default_avatar.png" ? friend.avatarUrl : undefined;

  return (
    <div
      className="fixed bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
      style={{
        right: `${rightOffset}px`, width: "300px",
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
        borderBottom: "none", boxShadow: theme.shadow.card,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 select-none" style={{ background: theme.button.bg }}>
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

        <button onClick={handleCall}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${theme.button.text}20`, color: theme.button.text }} title={t.chat.call}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        <button onClick={() => navigate(`/messages?friend=${friend.id}`)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${theme.button.text}20`, color: theme.button.text }} title={t.messages.detail}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${theme.button.text}20`, color: theme.button.text }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-3 flex flex-col gap-1"
        style={{ height: "320px", background: theme.background.page }}>
        {messages.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: theme.text.placeholder }}>
            {t.chat.noMessages}
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {msg.type === "image" ? (
                  <>
                    <img src={msg.content} alt="img" className="max-w-[75%] rounded-xl"
                      style={{ opacity: msg.status === "sending" ? 0.6 : 1 }} />
                    {isMe && <ImageStatus status={msg.status} />}
                  </>
                ) : (
                  <>
                    <div
                      className="max-w-[75%] px-3 py-2 rounded-2xl text-sm"
                      style={{
                        background: isMe ? theme.button.bg : theme.background.card,
                        color: isMe ? theme.button.text : theme.text.primary,
                        borderBottomRightRadius: isMe ? "4px" : undefined,
                        borderBottomLeftRadius: !isMe ? "4px" : undefined,
                        opacity: msg.status === "failed" ? 0.6 : 1,
                      }}
                    >
                      <span style={{ wordBreak: "break-word" }}>{msg.content}</span>
                    </div>
                    {/* Text failed — hiện retry */}
                    {isMe && msg.status === "failed" && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-[10px]" style={{ color: theme.text.error }}>{t.chat.failed}</p>
                        <button onClick={() => handleRetryText(msg)}
                          className="text-[10px] underline hover:opacity-70"
                          style={{ color: theme.text.error }}>
                          · {t.chat.retry}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: `1px solid ${theme.border.default}`, background: theme.background.card }}>
        <button onClick={() => fileInputRef.current?.click()}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
          style={{ background: theme.background.input, color: theme.text.secondary }} title={t.chat.sendImage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={t.chat.typeMessage}
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: theme.text.primary }} />

        <button onClick={handleSend} disabled={!input.trim()}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 disabled:opacity-40"
          style={{ background: theme.button.bg, color: theme.button.text }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
