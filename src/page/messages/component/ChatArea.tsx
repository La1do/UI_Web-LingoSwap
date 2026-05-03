import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useApi } from "../../../hook/useApi";
import { useFriends, type Friend } from "../../../context/FriendContext";
import { chatService, type ChatMessage, type UploadImageResponse } from "../../../services/chat.service";
import { socketService } from "../../../services/socket.service";

interface ChatAreaProps {
  friend: Friend;
}

export default function ChatArea({ friend }: ChatAreaProps) {
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

  // Reset khi đổi friend
  useEffect(() => {
    setMessages([]);
    setInput("");
    convIdRef.current = friend.conversationId ?? null;

    if (!friend.conversationId) return;
    fetchMessages(chatService.getMessages(friend.conversationId)).then((data) => {
      if (data) setMessages(data);
    });
  }, [friend.id, friend.conversationId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime socket
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
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, newMsg];
      });

      if (!convIdRef.current && msg.conversationId) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
    };

    const sentHandler = (msg: { _id: string; content: string; createdAt: string; conversationId?: string }) => {
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

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const tempMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: convIdRef.current ?? "",
      senderId: user?.id ?? "",
      content: text,
      type: "text",
      createdAt: { full: "", friendly: t.chat.you },
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketService.sendMessage({
      partnerId: friend.id,
      content: text,
      matchSessionId: null,
    });
  }, [input, friend.id, user?.id]);

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
        createdAt: { full: "", friendly: "Đang gửi..." },
      };
      setMessages((prev) => [...prev, tempMsg]);

      uploadImageExec(chatService.uploadImage(file, friend.id, null)).then((res) => {
        if (res) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId
                ? { ...m, _id: res._id, content: res.content, conversationId: res.conversationId }
                : m
            )
          );
          if (!convIdRef.current && res.conversationId) {
            convIdRef.current = res.conversationId;
            updateConversationId(friend.id, res.conversationId);
          }
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCall = () => {
    const params = new URLSearchParams({
      target: friend.id,
      name: friend.fullName,
      ...(friend.avatarUrl ? { avatar: friend.avatarUrl } : {}),
    });
    navigate(`/direct-call?${params.toString()}`);
  };

  const validAvatar = friend.avatarUrl && friend.avatarUrl !== "default_avatar.png"
    ? friend.avatarUrl
    : undefined;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.background.page }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: theme.background.card,
          borderBottom: `1px solid ${theme.border.default}`,
        }}
      >
        <div className="relative shrink-0">
          {validAvatar ? (
            <img src={validAvatar} alt={friend.fullName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {friend.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          {friend.status === "online" && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: theme.status.online, borderColor: theme.background.card }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>
            {friend.fullName}
          </p>
          <p className="text-xs" style={{ color: friend.status === "online" ? theme.status.online : theme.text.placeholder }}>
            {friend.status === "online" ? t.messages.online : (friend.lastSeen ?? t.messages.offline)}
          </p>
        </div>

        {/* Call button */}
        <button
          onClick={handleCall}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input, color: theme.text.secondary }}
          title={t.chat.call}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-xs text-center py-12" style={{ color: theme.text.placeholder }}>
            {t.chat.noMessages}
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {msg.type === "image" ? (
                  <img src={msg.content} alt="img" className="max-w-[60%] rounded-2xl" />
                ) : (
                  <div
                    className="max-w-[65%] px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: isMe ? theme.button.bg : theme.background.card,
                      color: isMe ? theme.button.text : theme.text.primary,
                      borderBottomRightRadius: isMe ? "4px" : undefined,
                      borderBottomLeftRadius: !isMe ? "4px" : undefined,
                      boxShadow: theme.shadow.card,
                    }}
                  >
                    <span style={{ wordBreak: "break-word" }}>{msg.content}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{
          borderTop: `1px solid ${theme.border.default}`,
          background: theme.background.card,
        }}
      >
        {/* Image button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
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
        <div
          className="flex-1 flex items-center px-4 py-2 rounded-2xl"
          style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t.chat.typeMessage}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: theme.text.primary }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 disabled:opacity-40"
          style={{ background: theme.button.bg, color: theme.button.text }}
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
