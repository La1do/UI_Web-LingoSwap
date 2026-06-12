import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useApi } from "../../../hook/useApi";
import { useFriends, type Friend } from "../../../context/FriendContext";
import { chatService, type ChatMessage, type UploadImageResponse } from "../../../services/chat.service";
import { socketService } from "../../../services/socket.service";

interface ChatAreaProps {
  friend: Friend;
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

export default function ChatArea({ friend }: ChatAreaProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { updateConversationId, recordFriendMessage, markFriendMessagesSeen } = useFriends();
  const { execute: fetchMessages } = useApi<ChatMessage[]>();
  const { execute: uploadImageExec } = useApi<UploadImageResponse>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const convIdRef = useRef<string | null>(friend.conversationId ?? null);
  const pendingTextRef = useRef<string[]>([]);

  useEffect(() => {
    markFriendMessagesSeen(friend.id);
  }, [friend.id, markFriendMessagesSeen]);

  useEffect(() => {
    convIdRef.current = friend.conversationId ?? null;
    if (!friend.conversationId) return;
    fetchMessages(chatService.getMessages(friend.conversationId)).then((data) => {
      if (data) setMessages(data);
    });
  }, [fetchMessages, friend.conversationId]);

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
      // Lọc: chỉ xử lý tin nhắn liên quan đến conversation này
      if (msg.senderId !== friend.id && msg.senderId !== user?.id) return;
      if (convIdRef.current && msg.conversationId !== convIdRef.current) return;

      if (msg.senderId === user?.id) {
        // Tin nhắn của chính mình phản hồi lại từ server
        // Không add mới — chỉ replace temp message hoặc bỏ qua nếu đã có
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          const tempIdx = prev.findIndex(
            (m) => m._id.startsWith("temp-") && m.senderId === user?.id && m.content === msg.content
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = {
              ...updated[tempIdx],
              _id: msg._id,
              conversationId: msg.conversationId,
              createdAt: msg.createdAt,
            };
            return updated;
          }
          return prev;
        });
      } else {
        // Tin nhắn từ đối phương — add vào UI
        const newMsg: ChatMessage = {
          _id: msg._id, conversationId: msg.conversationId,
          senderId: msg.senderId, content: msg.content,
          type: msg.type as "text" | "image", createdAt: msg.createdAt,
        };
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Cập nhật convId nếu đây là conversation đầu tiên
      if (!convIdRef.current && msg.conversationId) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }

      recordFriendMessage(friend.id, msg, { unread: false });
      markFriendMessagesSeen(friend.id);
    };

    const sentHandler = (msg: { _id: string; content: string; createdAt: string; conversationId?: string }) => {
      // Cập nhật convId nếu đây là conversation đầu tiên
      if (msg.conversationId && !convIdRef.current) {
        convIdRef.current = msg.conversationId;
        updateConversationId(friend.id, msg.conversationId);
      }
      // Replace temp message bằng message thật từ server
      const pendingIndex = pendingTextRef.current.findIndex((content) => content === msg.content);
      if (pendingIndex === -1) return;

      pendingTextRef.current.splice(pendingIndex, 1);
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [
          ...prev,
          {
            _id: msg._id,
            conversationId: msg.conversationId ?? convIdRef.current ?? "",
            senderId: user?.id ?? "",
            content: msg.content,
            type: "text",
            createdAt: msg.createdAt,
          },
        ];
      });

      recordFriendMessage(friend.id, {
        _id: msg._id,
        senderId: user?.id ?? "",
        content: msg.content,
        type: "text",
        createdAt: msg.createdAt,
        conversationId: msg.conversationId ?? convIdRef.current ?? "",
      }, { unread: false });
    };

    const errorHandler = () => {
      if (pendingTextRef.current.length === 0) return;
      pendingTextRef.current.shift();
      toast.error(t.chat.forbiddenMessage);
    };

    s.on("receive_message", handler);
    s.on("message_sent_success", sentHandler);
    s.on("error", errorHandler);
    return () => {
      s.off("receive_message", handler);
      s.off("message_sent_success", sentHandler);
      s.off("error", errorHandler);
    };
  }, [
    friend.id,
    markFriendMessagesSeen,
    recordFriendMessage,
    t.chat.forbiddenMessage,
    toast,
    updateConversationId,
    user?.id,
  ]);

  // Text: socket — check connected, không có loading state
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const socket = socketService.getSocket();
    const isConnected = socket?.connected ?? false;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const tempMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: convIdRef.current ?? "",
      senderId: user?.id ?? "",
      content: text,
      type: "text",
      createdAt: { full: "", friendly: "" },
    };
    if (!isConnected) {
      toast.error(t.chat.failed);
      return;
    }

    pendingTextRef.current.push(tempMsg.content);
    socketService.sendMessage({ partnerId: friend.id, content: tempMsg.content, matchSessionId: null });
  }, [input, friend.id, t.chat.failed, toast, user?.id]);

  const handleRetryText = useCallback((msg: ChatMessage) => {
    const socket = socketService.getSocket();
    if (!socket?.connected) return;

    setMessages((prev) => prev.filter((m) => m._id !== msg._id));
    pendingTextRef.current.push(msg.content);
    socketService.sendMessage({ partnerId: friend.id, content: msg.content, matchSessionId: null });
  }, [friend.id]);

  // Image: API — có sending/sent/failed
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
          recordFriendMessage(friend.id, {
            _id: res._id,
            senderId: user?.id ?? "",
            content: res.content,
            type: res.type,
            createdAt: new Date().toISOString(),
            conversationId: res.conversationId,
          }, { unread: false });
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

  const validAvatar = friend.avatarUrl && friend.avatarUrl !== "default_avatar.png" ? friend.avatarUrl : undefined;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.background.page }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: theme.background.card, borderBottom: `1px solid ${theme.border.default}` }}>
        <div className="relative shrink-0">
          {validAvatar ? (
            <img src={validAvatar} alt={friend.fullName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: theme.button.bg, color: theme.button.text }}>
              {friend.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          {friend.status === "online" && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: theme.status.online, borderColor: theme.background.card }} />
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

        <button onClick={handleCall}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input, color: theme.text.secondary }} title={t.chat.call}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {messages.length === 0 ? (
          <p className="text-xs text-center py-12" style={{ color: theme.text.placeholder }}>
            {t.chat.noMessages}
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {msg.type === "image" ? (
                  <>
                    <img src={msg.content} alt="img" className="max-w-[60%] rounded-2xl"
                      style={{ opacity: msg.status === "sending" ? 0.6 : 1 }} />
                    {isMe && <ImageStatus status={msg.status} />}
                  </>
                ) : (
                  <>
                    <div
                      className="max-w-[65%] px-4 py-2.5 rounded-2xl text-sm"
                      style={{
                        background: isMe ? theme.button.bg : theme.background.card,
                        color: isMe ? theme.button.text : theme.text.primary,
                        borderBottomRightRadius: isMe ? "4px" : undefined,
                        borderBottomLeftRadius: !isMe ? "4px" : undefined,
                        boxShadow: theme.shadow.card,
                        opacity: msg.status === "failed" ? 0.6 : 1,
                      }}
                    >
                      <span style={{ wordBreak: "break-word" }}>{msg.content}</span>
                    </div>
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

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderTop: `1px solid ${theme.border.default}`, background: theme.background.card }}>
        <button onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
          style={{ background: theme.background.input, color: theme.text.secondary }} title={t.chat.sendImage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <div className="flex-1 flex items-center px-4 py-2 rounded-2xl"
          style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t.chat.typeMessage}
            className="flex-1 text-sm outline-none bg-transparent resize-none leading-5"
            style={{
              color: theme.text.primary,
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
        </div>

        <button onClick={handleSend} disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 disabled:opacity-40"
          style={{ background: theme.button.bg, color: theme.button.text }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
