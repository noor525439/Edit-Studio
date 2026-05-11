import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  Edit2,
  Trash2,
  Play,
  Check,
  X,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  Smile,
} from "lucide-react";
import { getSocket } from "../lib/socket";

const API_BASE = "http://localhost:3000/workflow";
const USERS_API = "http://localhost:3000/api/users/search";

const getThreadLabel = (thread, currentUser) => {
  const participants = thread.participantIds || [];
  const currentUserId = String(currentUser?._id || "");
  const others = participants.filter((p) => {
    const id = typeof p === "object" ? String(p._id) : String(p);
    return id !== currentUserId;
  });
  if (others.length === 0) return "You";
  return others
    .map((p) =>
      typeof p === "object" ? p.username || p.name || "User" : "User",
    )
    .join(", ");
};

const getOtherParticipant = (thread, currentUser) => {
  const participants = thread.participantIds || [];
  const currentUserId = String(currentUser?._id || "");
  const others = participants.filter((p) => {
    const id = typeof p === "object" ? String(p._id) : String(p);
    return id !== currentUserId;
  });
  if (others.length === 0) return null;
  return typeof others[0] === "object" ? others[0] : null;
};

const Avatar = ({ name, src, sizeClass = "h-8 w-8", online = false }) => {
  const initial = String(name || "U")
    .charAt(0)
    .toUpperCase();
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const colorClass = colors[initial.charCodeAt(0) % colors.length];
  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt=""
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full flex items-center justify-center text-xs font-semibold ${colorClass} ring-2 ring-white shadow-sm`}
        >
          {initial}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
      )}
    </div>
  );
};

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4"
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="flex gap-3 mt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ContextMenu = ({ x, y, onEdit, onDelete, onClose }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    setPos({
      x: x + 160 > window.innerWidth ? x - 160 : x,
      y: y + 100 > window.innerHeight ? y - 100 : y,
    });
  }, [x, y]);
  useEffect(() => {
    const handle = () => onClose();
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return (
    <div
      ref={ref}
      style={{ top: pos.y, left: pos.x, position: "fixed", zIndex: 9999 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[150px] py-1"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        <Edit2 size={14} />
        <span>Edit</span>
      </button>
      <div className="mx-3 border-t border-gray-100" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
};

const AttachmentChip = ({ file, previewUrl, onRemove }) => (
  <div className="relative inline-flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1.5 pr-1">
    {previewUrl ? (
      <img
        src={previewUrl}
        alt=""
        className="h-10 w-10 rounded-lg object-cover"
      />
    ) : (
      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
        <ImageIcon size={16} className="text-gray-400" />
      </div>
    )}
    <span className="text-xs text-gray-600 max-w-[100px] truncate">
      {file.name}
    </span>
    <button
      type="button"
      onClick={onRemove}
      className="w-5 h-5 rounded-full bg-gray-300 hover:bg-red-400 hover:text-white flex items-center justify-center transition-colors ml-1"
    >
      <X size={11} />
    </button>
  </div>
);

const VideoAttachment = ({ attachment }) => {
  const [showThumb, setShowThumb] = useState(false);
  return (
    <div className="relative inline-block">
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 bg-black/10 hover:bg-black/20 transition-colors px-3 py-2 rounded-xl"
      >
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <Play size={14} className="ml-0.5" fill="currentColor" />
        </div>
        <div className="text-xs">
          <p className="font-medium">Video</p>
          <p className="opacity-70">Tap to open</p>
        </div>
      </a>
      {attachment.thumbnailUrl && (
        <button
          type="button"
          onClick={() => setShowThumb((v) => !v)}
          className="mt-1 text-[10px] underline opacity-60 hover:opacity-100 block"
        >
          {showThumb ? "Hide preview" : "Show preview"}
        </button>
      )}
      <AnimatePresence>
        {showThumb && attachment.thumbnailUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            className="mt-1 rounded-xl overflow-hidden shadow-lg"
          >
            <img
              src={attachment.thumbnailUrl}
              alt=""
              className="max-w-[220px] max-h-[140px] object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const uploadImageFile = async (file, getAuthHeader) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post("http://localhost:3000/user/upload", formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data?.url || res.data?.data?.[0]?.url;
};

const markReadRequest = async (threadId, getAuthHeader) => {
  if (!threadId) return;
  try {
    await axios.patch(
      `${API_BASE}/chat/threads/${threadId}/read`,
      {},
      getAuthHeader(),
    );
  } catch {}
};

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const ReactionPicker = ({ onPick, isOwn }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: 4 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className={`absolute z-50 flex gap-1 bg-white border border-gray-100 rounded-full shadow-xl px-2 py-1.5 -top-10 ${isOwn ? "right-0" : "left-0"}`}
    onMouseDown={(e) => e.stopPropagation()}
  >
    {REACTIONS.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() => onPick(emoji)}
        className="text-lg hover:scale-125 transition-transform leading-none select-none"
      >
        {emoji}
      </button>
    ))}
  </motion.div>
);

const ChatPanel = ({
  threads: serverThreads,
  onSuccess,
  getAuthHeader,
  currentUser,
  unreadByThread = {},
  onThreadOpened = () => {},
}) => {
  const [localThreads, setLocalThreads] = useState(serverThreads || []);

  const handleSocketNewMessage = useCallback(
    ({ threadId, message }) => {
      setLocalThreads((prev) =>
        prev.map((t) => {
          if (String(t._id) !== String(threadId)) return t;
          const msgs = t.messages || [];
          const alreadyExists = msgs.some(
            (m) => String(m._id) === String(message._id),
          );
          if (alreadyExists) return t;

          const isMine =
            String(message.senderId?._id || message.senderId) ===
            String(currentUser?._id);
          if (isMine) {
            const hasOptimistic = msgs.some((m) => m._optimistic);
            if (hasOptimistic) {
              let replaced = false;
              const updated = msgs.map((m) => {
                if (!replaced && m._optimistic) {
                  replaced = true;
                  return { ...message, _optimistic: false };
                }
                return m;
              });
              return { ...t, messages: updated };
            }
          }
          return {
            ...t,
            messages: [...msgs, { ...message, _optimistic: false }],
          };
        }),
      );
    },
    [currentUser?._id],
  );

  const handleSocketMessageUpdated = useCallback(
    ({ threadId, messageId }) => {
      axios
        .get(`${API_BASE}/chat/threads`, getAuthHeader())
        .then((res) => {
          const fresh = (res.data?.data || []).find(
            (t) => String(t._id) === String(threadId),
          );
          if (!fresh) return;
          setLocalThreads((prev) =>
            prev.map((t) => {
              if (String(t._id) !== String(threadId)) return t;
              const freshIds = new Set(
                (fresh.messages || []).map((m) => String(m._id)),
              );
              const pending = (t.messages || []).filter(
                (m) => m._optimistic && !freshIds.has(String(m._id)),
              );
              return {
                ...fresh,
                messages: [...(fresh.messages || []), ...pending],
              };
            }),
          );
        })
        .catch(() => {});
    },
    [getAuthHeader],
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("chat:new-message", handleSocketNewMessage);
    socket.on("chat:message-updated", handleSocketMessageUpdated);
    return () => {
      socket.off("chat:new-message", handleSocketNewMessage);
      socket.off("chat:message-updated", handleSocketMessageUpdated);
    };
  }, [handleSocketNewMessage, handleSocketMessageUpdated]);

  const mergeServerThreads = useCallback((incoming) => {
    if (!incoming) return;
    setLocalThreads((prev) => {
      const prevMap = new Map(prev.map((t) => [String(t._id), t]));
      return incoming.map((serverThread) => {
        const existing = prevMap.get(String(serverThread._id));
        if (!existing) return serverThread;
        const serverMsgIds = new Set(
          (serverThread.messages || []).map((m) => String(m._id)),
        );
        const stillPending = (existing.messages || []).filter(
          (m) => m._optimistic && !serverMsgIds.has(String(m._id)),
        );
        return {
          ...serverThread,
          messages: [...(serverThread.messages || []), ...stillPending],
        };
      });
    });
  }, []);

  useEffect(() => {
    mergeServerThreads(serverThreads);
  }, [serverThreads, mergeServerThreads]);

  const [deletedThreadIds, setDeletedThreadIds] = useState(new Set());

  const visibleThreads = useMemo(
    () => localThreads.filter((t) => !deletedThreadIds.has(t._id)),
    [localThreads, deletedThreadIds],
  );

  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState({});
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    messageId: null,
  });
  const [deleteThreadModal, setDeleteThreadModal] = useState({
    open: false,
    threadId: null,
  });

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevThreadIdRef = useRef("");

  const selectedThread = useMemo(
    () => visibleThreads.find((t) => t._id === selectedThreadId),
    [visibleThreads, selectedThreadId],
  );
  const totalUnread = Object.values(unreadByThread).reduce(
    (a, b) => a + Number(b || 0),
    0,
  );

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    if (selectedThreadId && selectedThreadId !== prevThreadIdRef.current) {
      scrollToBottom();
      prevThreadIdRef.current = selectedThreadId;
    }
  }, [selectedThreadId, scrollToBottom]);

  useEffect(() => {
    const messages = selectedThread?.messages || [];
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    const isOwn = lastMsg
      ? String(lastMsg.senderId?._id || lastMsg.senderId) ===
        String(currentUser?._id)
      : false;
    if (isOwn) {
      scrollToBottom();
      isAtBottomRef.current = true;
      return;
    }
    if (isAtBottomRef.current) scrollToBottom();
  }, [selectedThread?.messages, currentUser?._id, scrollToBottom]);

  useEffect(() => {
    if (selectedThreadId) scrollToBottom();
  }, [selectedThreadId, scrollToBottom]);

  useEffect(() => {
    if (!selectedThreadId) return;
    markReadRequest(selectedThreadId, getAuthHeader);
  }, [selectedThreadId, selectedThread?.messages?.length, getAuthHeader]);

  useEffect(() => {
    if (visibleThreads.length > 0 && !selectedThreadId)
      setSelectedThreadId(visibleThreads[0]._id);
  }, [visibleThreads, selectedThreadId]);

  useEffect(() => {
    const handle = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      )
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (!reactionPickerMsgId) return;
    const handle = () => setReactionPickerMsgId(null);
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [reactionPickerMsgId]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSearchResults([]);
      setHighlightedIndex(-1);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(USERS_API, {
          ...getAuthHeader(),
          params: { q, limit: 8 },
        });
        const uid = String(currentUser?._id || "");
        const users = (res.data?.data || []).filter(
          (u) => String(u._id) !== uid,
        );
        setSearchResults(users);
        setHighlightedIndex(users.length ? 0 : -1);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, getAuthHeader, currentUser?._id]);

  const createThreadWithUser = async (userId, username) => {
    try {
      const res = await axios.post(
        `${API_BASE}/chat/threads`,
        { participantIds: [userId] },
        getAuthHeader(),
      );
      const newThread = res.data.data;
      setLocalThreads((prev) => {
        const exists = prev.some(
          (t) => String(t._id) === String(newThread._id),
        );
        return exists ? prev : [newThread, ...prev];
      });
      setSelectedThreadId(newThread._id);
      setSearchTerm("");
      setSearchResults([]);
      setHighlightedIndex(-1);
      setShowDropdown(false);
      toast.success(`Conversation started with ${username}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create thread");
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!files.length) return;
    setAttachedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const removeAttachedFile = (idx) => {
    setAttachedFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!selectedThreadId || sending) return;
      const bodyText = text.trim();
      if (!bodyText && !attachedFiles.length && !videoUrl.trim()) return;

      setSending(true);
      const savedText = bodyText;
      const savedFiles = [...attachedFiles];
      const savedVideoUrl = videoUrl;
      const savedVideoThumb = videoThumb;

      setText("");
      setAttachedFiles([]);
      setVideoUrl("");
      setVideoThumb("");
      setShowVideoInput(false);
      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = "40px";
      }

      const optimisticId = `opt-${Date.now()}`;
      const optimisticMsg = {
        _id: optimisticId,
        text: savedText,
        senderId: currentUser,
        createdAt: new Date().toISOString(),
        attachments: [],
        _optimistic: true,
      };

      setLocalThreads((prev) =>
        prev.map((t) =>
          t._id === selectedThreadId
            ? { ...t, messages: [...(t.messages || []), optimisticMsg] }
            : t,
        ),
      );
      setTimeout(() => scrollToBottom(), 30);

      try {
        const imageAttachments = [];
        for (const { file } of savedFiles) {
          try {
            const url = await uploadImageFile(file, getAuthHeader);
            if (url)
              imageAttachments.push({
                url,
                mediaType: "image",
                thumbnailUrl: "",
              });
          } catch {
            toast.error(`Failed to upload ${file.name}`);
          }
        }

        const attachments = [
          ...imageAttachments,
          ...(savedVideoUrl.trim()
            ? [
                {
                  url: savedVideoUrl.trim(),
                  mediaType: "video",
                  thumbnailUrl: savedVideoThumb.trim(),
                },
              ]
            : []),
        ];

        await axios.post(
          `${API_BASE}/chat/threads/${selectedThreadId}/messages`,
          { text: savedText, attachments },
          getAuthHeader(),
        );
        setTimeout(() => scrollToBottom(), 30);
      } catch (err) {
        setLocalThreads((prev) =>
          prev.map((t) =>
            t._id === selectedThreadId
              ? {
                  ...t,
                  messages: (t.messages || []).filter(
                    (m) => m._id !== optimisticId,
                  ),
                }
              : t,
          ),
        );
        setText(savedText);
        setAttachedFiles(savedFiles);
        toast.error(err?.response?.data?.message || "Message failed to send");
      } finally {
        setSending(false);
      }
    },
    [
      selectedThreadId,
      text,
      attachedFiles,
      videoUrl,
      videoThumb,
      getAuthHeader,
      sending,
      currentUser,
      scrollToBottom,
    ],
  );

  useEffect(() => {
    if (selectedThreadId) onThreadOpened(selectedThreadId);
  }, [selectedThreadId, onThreadOpened]);

  const handleSearchKeyDown = (e) => {
    if (!showDropdown || !searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => (p + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => (p <= 0 ? searchResults.length - 1 : p - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = searchResults[highlightedIndex];
      if (s) createThreadWithUser(s._id, s.username);
    } else if (e.key === "Escape") setShowDropdown(false);
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - date) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getLastMessage = (thread) => {
    const msgs = (thread.messages || []).filter((m) => !m.deletedAt);
    return msgs.length === 0 ? null : msgs[msgs.length - 1];
  };

  const threadPreview = (thread) => {
    const m = getLastMessage(thread);
    if (!m) return "No messages yet";
    return (
      `${m.attachments?.length ? "📎 " : ""}${m.text || ""}`.trim() || "Media"
    );
  };

  const saveEdit = async (messageId) => {
    if (!selectedThreadId) return;
    const draft = editDraft.trim();
    if (!draft) return;

    setLocalThreads((prev) =>
      prev.map((t) =>
        t._id === selectedThreadId
          ? {
              ...t,
              messages: (t.messages || []).map((m) =>
                m._id === messageId
                  ? { ...m, text: draft, editedAt: new Date().toISOString() }
                  : m,
              ),
            }
          : t,
      ),
    );
    setEditingId("");
    setEditDraft("");

    try {
      await axios.patch(
        `${API_BASE}/chat/threads/${selectedThreadId}/messages/${messageId}`,
        { text: draft },
        getAuthHeader(),
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update message");
    }
  };

  const openDeleteModal = (messageId) =>
    setDeleteModal({ open: true, messageId });

  const confirmDeleteMessage = async () => {
    const messageId = deleteModal.messageId;
    setDeleteModal({ open: false, messageId: null });
    if (!selectedThreadId || !messageId) return;

    setLocalThreads((prev) =>
      prev.map((t) =>
        t._id === selectedThreadId
          ? {
              ...t,
              messages: (t.messages || []).filter((m) => m._id !== messageId),
            }
          : t,
      ),
    );

    try {
      await axios.delete(
        `${API_BASE}/chat/threads/${selectedThreadId}/messages/${messageId}`,
        getAuthHeader(),
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete message");
      onSuccess();
    }
  };

  const openDeleteThreadModal = (threadId) =>
    setDeleteThreadModal({ open: true, threadId });

  const confirmDeleteThread = async () => {
    const threadId = deleteThreadModal.threadId;
    setDeleteThreadModal({ open: false, threadId: null });
    if (!threadId) return;
    setDeletedThreadIds((prev) => new Set([...prev, threadId]));
    if (selectedThreadId === threadId) {
      const remaining = visibleThreads.filter((t) => t._id !== threadId);
      setSelectedThreadId(remaining[0]?._id || "");
    }
    toast.success("Conversation deleted");
    try {
      await axios.delete(
        `${API_BASE}/chat/threads/${threadId}`,
        getAuthHeader(),
      );
    } catch {}
  };

  const handleRightClick = (e, msg, isOwn) => {
    if (!isOwn || msg.deletedAt) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msg._id,
      text: msg.text || "",
    });
  };

  const handleReaction = useCallback(
    async (messageId, emoji) => {
      setReactionPickerMsgId(null);
      const userId = String(currentUser?._id || "me");
      setReactions((prev) => {
        const msgR = { ...(prev[messageId] || {}) };
        const users = [...(msgR[emoji] || [])];
        const idx = users.indexOf(userId);
        if (idx > -1) users.splice(idx, 1);
        else users.push(userId);
        return { ...prev, [messageId]: { ...msgR, [emoji]: users } };
      });
      try {
        await axios.put(
          `${API_BASE}/chat/threads/${selectedThreadId}/messages/${messageId}/react`,
          { emoji },
          getAuthHeader(),
        );
      } catch {}
    },
    [currentUser?._id, selectedThreadId, getAuthHeader],
  );

  const renderAttachment = (attachment, idx) => {
    if (attachment.mediaType === "image") {
      return (
        <a
          key={idx}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-xl overflow-hidden max-w-[220px] hover:opacity-90 transition"
        >
          <img src={attachment.url} alt="" className="w-full object-cover" />
        </a>
      );
    }
    return <VideoAttachment key={idx} attachment={attachment} />;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Message?"
        description="This message will be permanently deleted and cannot be recovered."
        confirmLabel="Delete"
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteModal({ open: false, messageId: null })}
      />

      <ConfirmModal
        isOpen={deleteThreadModal.open}
        title="Delete Conversation?"
        description="This will hide the conversation from your list. This action cannot be undone."
        confirmLabel="Delete Chat"
        onConfirm={confirmDeleteThread}
        onCancel={() => setDeleteThreadModal({ open: false, threadId: null })}
      />

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            key="ctx"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08 }}
          >
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onEdit={() => {
                setEditingId(contextMenu.messageId);
                setEditDraft(contextMenu.text);
              }}
              onDelete={() => openDeleteModal(contextMenu.messageId)}
              onClose={() => setContextMenu(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4 font-sans max-w-7xl mx-auto h-[calc(100vh-2rem)] min-h-[500px]">
        <div className="w-full md:w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-gray-800">Chats</h2>
            </div>
            {totalUnread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>

          <div className="px-3 pt-3 pb-2" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                className="w-full pl-8 pr-3 py-2 text-sm border-0 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-gray-400"
                placeholder="Search or start new chat"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleSearchKeyDown}
              />
              {showDropdown && (searchTerm.trim() || searching) && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white rounded-xl border border-gray-100 shadow-xl max-h-60 overflow-y-auto">
                  {searching && (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Searching...
                    </div>
                  )}
                  {!searching && !searchResults.length && (
                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                      No users found
                    </div>
                  )}
                  {!searching &&
                    searchResults.map((user, idx) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() =>
                          createThreadWithUser(user._id, user.username)
                        }
                        className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${idx === highlightedIndex ? "bg-gray-50" : ""}`}
                      >
                        <Avatar
                          name={user.username}
                          src={user.avatar}
                          sizeClass="h-9 w-9"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {visibleThreads.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-14 text-center"
              >
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">
                  💬
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Search someone to start chatting
                </p>
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {visibleThreads.map((thread) => {
                const label = getThreadLabel(thread, currentUser);
                const otherP = getOtherParticipant(thread, currentUser);
                const unread = Number(unreadByThread[thread._id] || 0);
                const isActive = thread._id === selectedThreadId;
                const lastMsg = getLastMessage(thread);
                const timestamp = lastMsg?.createdAt
                  ? formatTimestamp(lastMsg.createdAt)
                  : "";
                return (
                  <motion.div
                    key={thread._id}
                    layout
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                    onClick={() => setSelectedThreadId(thread._id)}
                  >
                    <Avatar
                      name={otherP?.username || label}
                      src={otherP?.avatar}
                      sizeClass="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                        >
                          {label}
                        </span>
                        {timestamp && (
                          <span
                            className={`text-[11px] flex-shrink-0 ml-2 ${unread > 0 ? "text-indigo-700 font-semibold" : "text-gray-400"}`}
                          >
                            {timestamp}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p
                          className={`text-xs truncate max-w-[160px] ${unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}
                        >
                          {threadPreview(thread)}
                        </p>
                        {unread > 0 && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selectedThread ? (
            (() => {
              const otherP = getOtherParticipant(selectedThread, currentUser);
              const label = getThreadLabel(selectedThread, currentUser);
              return (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
                  <Avatar
                    name={otherP?.username || label}
                    src={otherP?.avatar}
                    sizeClass="h-10 w-10"
                    online
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="px-4 py-3.5 border-b border-gray-100 text-sm text-gray-400 flex-shrink-0">
              Select a conversation
            </div>
          )}

          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto flex flex-col"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1fae5' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            <div className="flex-1 px-4 pt-4 pb-2 flex flex-col gap-1">
              {!selectedThread && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                    💬
                  </div>
                  <p className="text-sm font-medium">
                    Select a conversation to start chatting
                  </p>
                </div>
              )}

              {selectedThread &&
                (selectedThread.messages || []).filter((m) => !m.deletedAt)
                  .length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full gap-2 text-gray-400"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">
                      👋
                    </div>
                    <p className="text-sm">Say hello!</p>
                  </motion.div>
                )}

              <AnimatePresence initial={false}>
                {selectedThread?.messages
                  ?.filter((msg) => !msg.deletedAt)
                  .map((msg, index, arr) => {
                    const isOwn =
                      String(msg.senderId?._id || msg.senderId) ===
                      String(currentUser?._id);
                    const senderName = msg.senderId?.username || "User";
                    const avatarSrc = msg.senderId?.avatar;
                    const isOptimistic = Boolean(msg._optimistic);
                    const prevMsg = arr[index - 1];
                    const showDate =
                      !prevMsg ||
                      new Date(msg.createdAt).toDateString() !==
                        new Date(prevMsg.createdAt).toDateString();
                    const msgReactions = reactions[msg._id] || {};
                    const hasReactions = Object.values(msgReactions).some(
                      (a) => a.length > 0,
                    );

                    return (
                      <React.Fragment key={msg._id}>
                        {showDate && msg.createdAt && (
                          <div className="flex items-center justify-center my-3">
                            <span className="text-[11px] text-gray-400 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                              {new Date(msg.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: isOptimistic ? 0.65 : 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={`group/msg flex gap-2 max-w-[78%] ${isOwn ? "self-end flex-row-reverse" : "self-start"}`}
                          onContextMenu={(e) => handleRightClick(e, msg, isOwn)}
                        >
                          {!isOwn && (
                            <Avatar
                              name={senderName}
                              src={avatarSrc}
                              sizeClass="h-7 w-7 mt-auto mb-1"
                            />
                          )}

                          <div
                            className={`flex flex-col gap-0.5 min-w-0 ${isOwn ? "items-end" : "items-start"}`}
                          >
                            {!isOwn && (
                              <span className="text-[11px] text-indigo-700 font-semibold px-1">
                                {senderName}
                              </span>
                            )}

                            <div
                              className={`relative flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                            >
                              <div className="relative">
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setReactionPickerMsgId((prev) =>
                                      prev === msg._id ? null : msg._id,
                                    );
                                  }}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 transition-all opacity-0 group-hover/msg:opacity-100 mb-1 flex-shrink-0"
                                >
                                  <Smile size={14} />
                                </button>
                                <AnimatePresence>
                                  {reactionPickerMsgId === msg._id && (
                                    <ReactionPicker
                                      isOwn={isOwn}
                                      onPick={(emoji) =>
                                        handleReaction(msg._id, emoji)
                                      }
                                    />
                                  )}
                                </AnimatePresence>
                              </div>

                              {editingId === msg._id ? (
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                  <textarea
                                    className="text-sm w-full border border-indigo-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
                                    rows={2}
                                    value={editDraft}
                                    autoFocus
                                    onChange={(e) =>
                                      setEditDraft(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        saveEdit(msg._id);
                                      }
                                      if (e.key === "Escape") {
                                        setEditingId("");
                                        setEditDraft("");
                                      }
                                    }}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => saveEdit(msg._id)}
                                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                    >
                                      <Check size={12} /> Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingId("");
                                        setEditDraft("");
                                      }}
                                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                    >
                                      <X size={12} /> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`text-sm px-3.5 py-2 rounded-2xl max-w-full break-words select-text ${isOwn ? "bg-indigo-600 text-white rounded-br-sm shadow-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"}`}
                                >
                                  {msg.text && (
                                    <p className="whitespace-pre-wrap">
                                      {msg.text}
                                    </p>
                                  )}
                                  {(msg.attachments || []).length > 0 && (
                                    <div className="mt-2 flex flex-col gap-2">
                                      {(msg.attachments || []).map((att, idx) =>
                                        renderAttachment(att, idx),
                                      )}
                                    </div>
                                  )}
                                  {msg.editedAt && (
                                    <span
                                      className={`text-[10px] block mt-0.5 ${isOwn ? "text-indigo-200" : "text-gray-400"}`}
                                    >
                                      edited
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {hasReactions && (
                              <div
                                className={`flex flex-wrap gap-1 mt-0.5 px-1 ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                {Object.entries(msgReactions).map(
                                  ([emoji, users]) =>
                                    users.length > 0 ? (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() =>
                                          handleReaction(msg._id, emoji)
                                        }
                                        className={`inline-flex items-center gap-0.5 text-xs rounded-full px-2 py-0.5 border transition hover:scale-105 ${users.includes(String(currentUser?._id || "me")) ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-600"}`}
                                      >
                                        <span>{emoji}</span>
                                        {users.length > 1 && (
                                          <span className="font-semibold ml-0.5">
                                            {users.length}
                                          </span>
                                        )}
                                      </button>
                                    ) : null,
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 px-1">
                              {msg.createdAt && (
                                <span className="text-[10px] text-gray-300">
                                  {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              )}
                              {isOptimistic && (
                                <span className="text-[10px] text-gray-300 animate-pulse">
                                  Sending…
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pt-2 pb-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 space-y-2 flex-shrink-0 sticky bottom-0">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((item, idx) => (
                    <AttachmentChip
                      key={idx}
                      file={item.file}
                      previewUrl={item.previewUrl}
                      onRemove={() => removeAttachedFile(idx)}
                    />
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showVideoInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 overflow-hidden"
                  >
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-gray-50"
                      placeholder="Video URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-gray-50"
                      placeholder="Thumbnail URL (optional)"
                      value={videoThumb}
                      onChange={(e) => setVideoThumb(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowVideoInput(false);
                        setVideoUrl("");
                        setVideoThumb("");
                      }}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0 self-center"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  disabled={!selectedThreadId}
                >
                  <ImageIcon size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoInput((v) => !v)}
                  className={`flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${showVideoInput ? "border-indigo-400 text-indigo-600 bg-indigo-50" : "border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300"}`}
                  disabled={!selectedThreadId}
                >
                  <Video size={16} />
                </button>
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:bg-white transition-all resize-none overflow-hidden leading-5"
                  placeholder={
                    selectedThreadId
                      ? `Message ${getThreadLabel(selectedThread, currentUser)}…`
                      : "Select a conversation first"
                  }
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={handleMessageKeyDown}
                  disabled={!selectedThreadId}
                  style={{ minHeight: "40px" }}
                />
                <motion.button
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    !selectedThreadId ||
                    sending ||
                    (!text.trim() && !attachedFiles.length && !videoUrl.trim())
                  }
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  {sending ? (
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  ) : (
                    <Send size={16} className="-mr-0.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
