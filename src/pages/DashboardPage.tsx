import {
  AlertCircle,
  ArrowDownCircle,
  Clock,
  Flame,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MinusCircle,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("USER");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("normal");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // استیت برای منوی کشویی موبایل
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // بررسی دسترسی‌ها به صورت کاملاً امن و سازگار با حروف کوچک/بزرگ
  const normalizedRole = currentUserRole ? currentUserRole.toUpperCase() : "";
  const isPrivileged =
    normalizedRole === "ADMIN" || normalizedRole === "SUPPORTER";

  // بررسی ادمین به صورت کاملاً مطمئن (چه ADMIN چه admin)
  const isAdmin =
    currentUserRole?.toUpperCase() === "ADMIN" ||
    currentUserRole?.toLowerCase() === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload) {
            setCurrentUserRole(payload.role || "USER");
            setCurrentUserName(
              payload.name || payload.email?.split("@")[0] || "",
            );
          }
        } catch (e) {
          console.error("Error decoding token role", e);
        }
      }

      try {
        const userRes = await api.get("/auth/me");
        if (userRes.data?.name) {
          setCurrentUserName(userRes.data.name);
        }
        if (userRes.data?.role) {
          setCurrentUserRole(userRes.data.role);
        }
      } catch (e) {
        console.error("Error fetching user profile", e);
      }

      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در دریافت لیست تیکت‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setSubmitting(true);
      await api.post("/tickets", {
        title,
        description,
        priority,
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority("normal");
      fetchTickets();

      toast.success("تیکت شما با موفقیت ثبت شد!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "خطا در ایجاد تیکت";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    if (!window.confirm("آیا از حذف این تیکت اطمینان دارید؟")) return;

    try {
      await api.delete(`/tickets/${ticketId}`);
      toast.success("تیکت با موفقیت حذف شد");
      fetchTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در حذف تیکت");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    return (
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.author?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalCount = tickets.length;
  const pendingCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || !t.status,
  ).length;

  const renderPriorityBadge = (prio: string) => {
    switch (prio) {
      case "high":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
            <Flame className="h-3 w-3" />
            زیاد
          </span>
        );
      case "low":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
            <ArrowDownCircle className="h-3 w-3" />
            کم
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <MinusCircle className="h-3 w-3" />
            متوسط
          </span>
        );
    }
  };

  return (
    <div
      className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
      dir="rtl"
    >
      {/* پس‌زمینه تیره برای موبایل هنگام باز بودن منو */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* سایدبار ریسپانسیو (دسکتاپ ثابت، موبایل کشویی/Drawer) */}
      <aside
        className={`w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shrink-0 h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 right-0 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md">
                <TicketIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight">
                  سامانه تیکت
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isPrivileged ? "پنل مدیریت و پشتیبانی" : "پنل کاربری"}
                </p>
              </div>
            </div>

            {/* دکمه بستن منو در موبایل */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{isPrivileged ? "مدیریت کل تیکت‌ها" : "داشبورد اصلی"}</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/settings");
              }}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <Settings className="h-4 w-4" />
              <span>تنظیمات حساب</span>
            </button>

            {isPrivileged && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl mt-2">
                <ShieldAlert className="h-4 w-4" />
                <span>دسترسی {isAdmin ? "ادمین" : "پشتیبان"} فعال است</span>
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
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${theme === "light" ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm" : "text-zinc-400"}`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${theme === "dark" ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm" : "text-zinc-400"}`}
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`grow flex h-8 items-center justify-center rounded-full transition-all ${theme === "system" ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm" : "text-zinc-400"}`}
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

      {/* محتوای اصلی */}
      <main className="grow p-4 md:p-10 space-y-8 overflow-y-auto">
        {/* هدر موبایل شامل دکمه منوی همبرگری */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold shadow-sm cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>منو</span>
          </button>

          {!isPrivileged && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-3 py-2 text-xs font-semibold shadow"
            >
              <Plus className="h-4 w-4" />
              <span>تیکت جدید</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold inline-flex items-center gap-1">
                {currentUserName || "کاربر گرامی"}
              </span>
              <span>عزیز خوش آمدید</span>
              <span className="inline-block animate-bounce origin-bottom">
                👋
              </span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isPrivileged
                ? "مدیریت تیکت‌های کاربران — مشاهده و پاسخ‌دهی به تمام درخواست‌های ثبت‌شده"
                : "تیکت‌های پشتیبانی — مدیریت و پیگیری درخواست‌های پشتیبانی شما"}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isPrivileged && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>تیکت جدید</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                کل تیکت‌ها
              </p>
              <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
            </div>
            <TicketIcon className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                در حال بررسی / باز
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-500">
                {pendingCount}
              </h3>
            </div>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder={
              isPrivileged
                ? "جستجو در تیکت‌ها یا نام کاربر..."
                : "جستجو در تیکت‌ها..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none transition-all shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-zinc-400">
              در حال بارگذاری...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && filteredTickets.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <LifeBuoy className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                تیکتی یافت نشد.
              </p>
            </div>
          )}
          {!loading && !error && filteredTickets.length > 0 && (
            <div className="grid gap-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm transition-all cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-sm">{ticket.title}</h4>
                      {renderPriorityBadge(ticket.priority)}
                      {isPrivileged && ticket.author && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                          <User className="h-3 w-3" />
                          {ticket.author.name} ({ticket.author.email})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${ticket.status === "closed" ? "bg-zinc-500/10 text-zinc-500" : ticket.status === "in_progress" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                    >
                      {ticket.status === "closed"
                        ? "بسته شده"
                        : ticket.status === "in_progress"
                          ? "در حال بررسی"
                          : "باز"}
                    </span>

                    {/* دکمه حذف برای ادمین */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteTicket(e, ticket.id)}
                        title="حذف تیکت"
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* مدال ایجاد تیکت */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-bold">ثبت تیکت جدید</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  عنوان تیکت
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="موضوع تیکت..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  اولویت
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                >
                  <option value="low">کم</option>
                  <option value="normal">متوسط</option>
                  <option value="high">زیاد</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  متن تیکت
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="شرح درخواست..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-5 py-2.5 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "در حال ارسال..." : "ثبت تیکت"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
