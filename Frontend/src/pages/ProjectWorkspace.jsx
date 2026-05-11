import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { getData } from "@/context/UserContext";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import {
  Briefcase,
  LineChart,
  Clock,
  MessageSquare,
  CreditCard,
  Star,
  Users,
  Package,
  Target,
  DollarSign,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Zap,
} from "lucide-react";

import OrderForm from "./OrderForm";
import ProgressTracker from "./ProgressTracker";
import TaskManager from "./TaskManager";
import ChatPanel from "./ChatPanel";
import PaymentsPanel from "./PaymentsPanel";
import ReviewsPanel from "./ReviewsPanel";
import EditorsPanel from "./EditorsPanel";

const API_BASE = "http://localhost:3000/workflow";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const TABS = [
  { id: "orders", label: "Orders", icon: Briefcase },
  { id: "progress", label: "Progress", icon: LineChart },
  { id: "tasks", label: "Tasks", icon: Clock },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "editors", label: "Editors", icon: Users },
];

const ProjectWorkspace = () => {
  const { user } = getData();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [threads, setThreads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editors, setEditors] = useState([]);
  const [unreadByThread, setUnreadByThread] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const normalizedRole = useMemo(() => {
    const role = String(user?.role || "").toLowerCase();
    if (role === "freelancer") return "client";
    return role;
  }, [user?.role]);

const visibleTabs = useMemo(() => {
  if (normalizedRole === "client") return TABS;
  if (normalizedRole === "editor") return TABS.filter((tab) => tab.id !== "orders" && tab.id !== "editors");
  return TABS.filter((tab) => tab.id !== "orders");
}, [normalizedRole]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || "chat");
    }
  }, [visibleTabs, activeTab]);

  const totalUnreadCount = useMemo(
    () => Object.values(unreadByThread).reduce((sum, count) => sum + Number(count || 0), 0),
    [unreadByThread]
  );

  const fetchAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [ordersRes, tasksRes, threadsRes, paymentsRes, editorsRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`, getAuthHeader()),
        axios.get(`${API_BASE}/tasks`, getAuthHeader()),
        axios.get(`${API_BASE}/chat/threads`, getAuthHeader()),
        axios.get(`${API_BASE}/payments`, getAuthHeader()),
        axios.get("http://localhost:3000/user/all-editors"),
      ]);
      const threadList = threadsRes.data.data || [];
      setOrders(ordersRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setThreads(threadList);
      setPayments(paymentsRes.data.data || []);
      setEditors(editorsRes.data.data || []);
      setUnreadByThread((prev) => {
        const next = { ...prev };
        threadList.forEach((t) => {
          if (typeof t.unreadCount === "number") next[t._id] = t.unreadCount;
        });
        return next;
      });
      if (showRefresh) toast.success("Workspace refreshed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load workspace data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const selectedThreadIdRef = useRef("");

  useEffect(() => {
    if (!user?._id) return undefined;

    const token = localStorage.getItem("accessToken");
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const playMessageBeep = () => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 740;
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.12);
      } catch {
        /* ignore */
      }
    };

    const onChatRefresh = () => {
      fetchAll();
    };

    socket.on("chat:new-message", ({ threadId, message }) => {
      const senderId = String(message?.senderId?._id || "");
      if (senderId === String(user._id)) return;

      fetchAll();
      const isChatTabActive = activeTab === "chat";
      const isSameThreadOpen = selectedThreadIdRef.current === threadId;
      if (!(isChatTabActive && isSameThreadOpen)) {
        playMessageBeep();
        toast.info(`New message from ${message?.senderId?.username || "a user"}`);
      }
    });

    socket.on("chat:message-updated", onChatRefresh);

    return () => {
      socket.off("chat:new-message");
      socket.off("chat:message-updated", onChatRefresh);
      disconnectSocket();
    };
  }, [user?._id, activeTab, fetchAll]);

  const handleThreadOpened = (threadId) => {
    selectedThreadIdRef.current = threadId;
    setUnreadByThread((prev) => {
      if (!prev[threadId]) return prev;
      return { ...prev, [threadId]: 0 };
    });
  };

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.progressStage !== "Completed").length;
    const activeTasks = tasks.filter((t) => t.timerStatus !== "completed").length;
    const completedOrders = orders.filter((o) => o.progressStage === "Completed").length;
    const totalPaidVolume = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const adminCommissionTotal = payments.reduce((sum, p) => sum + (Number(p.adminCommissionAmount) || 0), 0);
    return {
      activeOrders,
      activeTasks,
      completedOrders,
      totalPaidVolume,
      adminCommissionTotal,
    };
  }, [orders, tasks, payments]);

  const statCards = useMemo(() => {
    const completionPct = orders.length ? Math.round((stats.completedOrders / orders.length) * 100) : 0;
    const base = [
      {
        label: "Active Orders",
        value: stats.activeOrders,
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
        detail: `${stats.activeOrders} in progress`,
      },
      {
        label: "Tasks Pending",
        value: stats.activeTasks,
        icon: Target,
        color: "text-amber-600",
        bg: "bg-amber-50",
        detail: `${stats.activeTasks} remaining`,
      },
    ];

    if (normalizedRole === "admin") {
      return [
        ...base,
        {
          label: "Platform commission (20%)",
          value: `PKR ${stats.adminCommissionTotal.toLocaleString()}`,
          icon: DollarSign,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          detail: "Admin wallet accrual from payments",
        },
        {
          label: "Completion rate",
          value: `${completionPct}%`,
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
          detail: `${stats.completedOrders} orders done`,
        },
      ];
    }

    if (normalizedRole === "editor") {
      const pending = Number(user?.editorPendingBalance || 0);
      return [
        ...base,
        {
          label: "Your order volume",
          value: `PKR ${stats.totalPaidVolume.toLocaleString()}`,
          icon: DollarSign,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          detail: "Payments on your assignments",
        },
        {
          label: "Pending balance",
          value: `PKR ${pending.toLocaleString()}`,
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
          detail: "80% share after client checkout",
        },
      ];
    }

    return [
      ...base,
      {
        label: "Your spending",
        value: `PKR ${stats.totalPaidVolume.toLocaleString()}`,
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        detail: "Recorded payments on your orders",
      },
      {
        label: "Completion rate",
        value: `${completionPct}%`,
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-50",
        detail: `${stats.completedOrders} orders done`,
      },
    ];
  }, [stats, normalizedRole, user?.editorPendingBalance, orders.length]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage video editing workflow efficiently</p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-2">{card.detail}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-lg`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

       <div className="flex justify-center w-full mb-8"> 
       <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-2 border border-gray-200 shadow-sm max-w-fit mx-auto">
      <div className="flex flex-wrap justify-center items-center gap-10">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-2 text-lg font-semibold rounded-full transition-all duration-300
              ${isActive 
                ? "bg-black text-white shadow-lg shadow-gray-200" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}
            `}
          >
            <Icon size={18} />
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.id === "chat" && totalUnreadCount > 0 && (
                <span
                  className="min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"
                  aria-label={`${totalUnreadCount} unread messages`}
                >
                  {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  </div>
</div>
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="space-y-3">
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6">
              {activeTab === "orders" && (
                <OrderForm
                  editors={editors}
                  onSuccess={() => fetchAll()}
                  getAuthHeader={getAuthHeader}
                  currentUserRole={normalizedRole}
                />
              )}
              {activeTab === "progress" && (
                <ProgressTracker
                  orders={orders}
                  onUpdate={() => fetchAll()}
                  getAuthHeader={getAuthHeader}
                  currentUserRole={normalizedRole}
                />
              )}
              {activeTab === "tasks" && (
                <TaskManager
                  orders={orders}
                  tasks={tasks}
                  editors={editors}
                  onSuccess={() => fetchAll()}
                  getAuthHeader={getAuthHeader}
                  currentUserRole={normalizedRole}
                />
              )}
              {activeTab === "chat" && (
                <ChatPanel
                  threads={threads}
                  onSuccess={() => fetchAll()}
                  getAuthHeader={getAuthHeader}
                  currentUser={user}
                  unreadByThread={unreadByThread}
                  onThreadOpened={handleThreadOpened}
                />
              )}
              {activeTab === "payments" && (
                <PaymentsPanel
                  orders={orders}
                  payments={payments}
                  onSuccess={() => fetchAll()}
                  getAuthHeader={getAuthHeader}
                  currentUserRole={normalizedRole}
                />
              )}
              {activeTab === "reviews" && (
                <ReviewsPanel
                  orders={orders}
                  editors={editors}
                  getAuthHeader={getAuthHeader}
                  currentUserRole={normalizedRole}
                />
              )}
              {activeTab === "editors" && <EditorsPanel editors={editors} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;