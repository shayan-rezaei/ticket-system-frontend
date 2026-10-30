import {
  AlertCircle,
  ArrowDownCircle,
  ArrowRight,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  MinusCircle,
  Monitor,
  Moon,
  Send,
  Settings,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
} from "lucide-react";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<string>("USER");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // بررسی وجود حداقل یک پیام از طرف ادمین
  const hasAdminReply = comments.some(
    (comment) => comment.author?.role === "ADMIN",
  );

  // ادمین همیشه اجازه ارسال پیام دارد.
  // کاربر فقط بعد از اولین پاسخ ادمین می‌تواند پیام بفرستد.
  const canSendMessage = currentUserRole === "ADMIN" || hasAdminReply;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));

          if (payload) {
            setCurrentUserRole(payload.role || "USER");
            setCurrentUserId(payload.userId || payload.id || "");
            setCurrentUserEmail(payload.email || "");
          }
        } catch (e) {
          console.error("Token decode error", e);
        }
      }

      const ticketRes = await api.get("/tickets");
      const currentTicket = ticketRes.data.find((t: any) => t.id === id);

      if (!currentTicket) {
        setError("تیکت مورد نظر یافت نشد.");
        return;
      }

      setTicket(currentTicket);

      const commentsRes = await api.get(`/comments/${id}`);
      setComments(commentsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در دریافت اطلاعات تیکت");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [comments]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // جلوگیری از ارسال پیام توسط کاربر قبل از پاسخ ادمین
    if (!canSendMessage) return;

    if (!newComment.trim() || ticket?.status === "closed") {
      return;
    }

    try {
      setSending(true);

      await api.post("/comments", {
        content: newComment,
        ticketId: id,
      });

      setNewComment("");

      const commentsRes = await api.get(`/comments/${id}`);
      setComments(commentsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "خطا در ارسال پاسخ");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, {
        status: newStatus,
      });

      fetchTicketDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || "خطا در تغییر وضعیت تیکت");
    }
  };

  const renderPriorityBadge = (prio: string) => {
    switch (prio) {
      case "high":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
            <Flame className="h-3 w-3" /> زیاد
          </span>
        );

      case "low":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
            <ArrowDownCircle className="h-3 w-3" /> کم
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <MinusCircle className="h-3 w-3" /> متوسط
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "closed":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-500/10 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> بسته شده
          </span>
        );

      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" /> در حال بررسی
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <HelpCircle className="h-3 w-3" /> باز
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm"
        dir="rtl"
      >
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-3 w-3 bg-zinc-900 dark:bg-white rounded-full"></div>
          <span>بارگذاری فضای گفتگو...</span>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6"
        dir="rtl"
      >
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center space-y-4 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>{error || "تیکت یافت نشد"}</span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-5 py-2.5 text-xs font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
      dir="rtl"
    >
      {/* سایدبار ثابت */}
      <aside className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 md:flex flex-col justify-between hidden shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md">
              <TicketIcon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-sm tracking-tight">سامانه تیکت</h2>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentUserRole === "ADMIN"
                  ? "پنل مدیریت (ادمین)"
                  : "پنل کاربری"}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>
                {currentUserRole === "ADMIN"
                  ? "مدیریت کل تیکت‌ها"
                  : "داشبورد اصلی"}
              </span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <Settings className="h-4 w-4" />
              <span>تنظیمات حساب</span>
            </button>

            {currentUserRole === "ADMIN" && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl mt-2">
                <ShieldAlert className="h-4 w-4" />
                <span>دسترسی ادمین فعال است</span>
              </div>
            )}
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 px-1">
              حالت پوسته
            </label>

            <div className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 p-1">
              <button
                onClick={() => setTheme("light")}
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${
                  theme === "light"
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-400"
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${
                  theme === "dark"
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-400"
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${
                  theme === "system"
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-400"
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* محتوای اصلی چت */}
      <div className="grow flex flex-col min-w-0">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
              >
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="space-y-0.5">
                <h2 className="text-sm font-bold tracking-tight line-clamp-1">
                  {ticket.title}
                </h2>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {ticket.status === "closed"
                    ? "گفتگوی بسته شده"
                    : "پشتیبانی آنلاین فعال"}
                </p>
              </div>
            </div>

            {currentUserRole === "ADMIN" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 hidden sm:inline">
                  مدیریت وضعیت:
                </span>

                <select
                  value={ticket.status || "open"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer text-amber-700 dark:text-amber-300"
                >
                  <option value="open">باز</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="closed">بسته شده</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {renderPriorityBadge(ticket.priority)}
                {renderStatusBadge(ticket.status)}
              </div>
            )}
          </div>
        </header>

        <main className="grow max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6 flex flex-col justify-between relative">
          <div className="space-y-4 pb-28 relative z-10" dir="ltr">
            <div
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm space-y-4 max-w-xl mx-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderPriorityBadge(ticket.priority)}
                  {renderStatusBadge(ticket.status)}
                </div>

                <span className="text-[11px] font-mono text-zinc-400">
                  #{ticket.id.slice(0, 6)}
                </span>
              </div>

              <h1 className="text-base font-bold">{ticket.title}</h1>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-right">
                {ticket.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    ثبت شده در{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  شروع گفتگو
                </span>
              </div>
            </div>

            {currentUserRole !== "ADMIN" && hasAdminReply && (
              <div
                className="max-w-xl mx-auto w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 flex items-center gap-3"
                dir="rtl"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    این تیکت به شایان رضائی ارجاع داده شده است
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    درخواست شما توسط شایان رضائی دریافت شده و پاسخ‌گویی آغاز شده
                    است.
                  </p>
                </div>
              </div>
            )}

            <div className="relative flex py-3 items-center" dir="rtl">
              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>

              <span className="shrink-0 mx-4 text-[10px] font-semibold tracking-widest uppercase text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                تاریخچه پیام‌ها
              </span>

              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            {comments.length === 0 ? (
              <div
                className="text-center py-12 text-xs text-zinc-400 bg-white dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800"
                dir="rtl"
              >
                هنوز پیامی در این گفتگو ثبت نشده است. اولین پیام را ارسال کنید.
              </div>
            ) : (
              <div className="space-y-4 flex flex-col">
                {comments.map((c) => {
                  const isMyMessage =
                    String(c.authorId) === String(currentUserId) ||
                    (c.author?.email && c.author.email === currentUserEmail);

                  return (
                    <div
                      key={c.id}
                      className={`flex w-full ${
                        isMyMessage ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm space-y-2 relative transition-all text-right ${
                          isMyMessage
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-br-2xl rounded-bl-sm mr-12 shadow"
                            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-2xl rounded-br-2xl ml-12"
                        }`}
                        dir="rtl"
                      >
                        <div
                          className={`flex items-center justify-between gap-6 text-[11px] font-semibold pb-1.5 border-b ${
                            isMyMessage
                              ? "border-zinc-700 dark:border-zinc-200 text-zinc-300 dark:text-zinc-700"
                              : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 dark:bg-white/20 text-[10px] font-bold uppercase">
                              {c.author?.name ? c.author.name.charAt(0) : "U"}
                            </span>

                            <span>{c.author?.name || "کاربر سامانه"}</span>
                          </div>

                          {c.author?.role === "ADMIN" ? (
                            <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                              پشتیبان
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                              کاربر
                            </span>
                          )}
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-line pt-0.5">
                          {c.content}
                        </p>

                        <div
                          className={`flex items-center justify-end gap-1.5 text-[10px] pt-1 font-mono ${
                            isMyMessage
                              ? "text-zinc-400 dark:text-zinc-500"
                              : "text-zinc-400"
                          }`}
                        >
                          <span>
                            {new Date(c.createdAt).toLocaleTimeString("fa-IR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isMyMessage && (
                            <CheckCheck className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={commentsEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* بخش ارسال پیام */}
        <div
          className="sticky bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md p-4 z-30 shadow-sm"
          dir="rtl"
        >
          <div className="max-w-4xl mx-auto">
            {ticket.status === "closed" ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-xs font-medium text-zinc-500">
                <Lock className="h-4 w-4 text-amber-500" />
                <span>
                  این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد.
                </span>
              </div>
            ) : !canSendMessage ? (
              <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>منتظر پاسخ ادمین باشید</span>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  پس از ارجاع به ادمین و ارسال اولین پاسخ توسط ادمین، امکان
                  ارسال پیام برای شما هم فعال می‌شود.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSendComment}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="grow rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none transition-all shadow-sm"
                />

                <button
                  type="submit"
                  disabled={sending || !newComment.trim()}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
