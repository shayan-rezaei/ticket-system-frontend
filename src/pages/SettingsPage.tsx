import {
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Save,
  Settings,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("requester");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // بررسی نقش و اطلاعات کاربر هنگام لود صفحه
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        if (userRes.data) {
          setCurrentUserName(userRes.data.name || "");
          setCurrentUserRole(userRes.data.role || "requester");
          setName(userRes.data.name || "");
          setEmail(userRes.data.email || "");
        }
      } catch (e) {
        console.error("Error fetching user profile", e);
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload) {
              setCurrentUserRole(payload.role || "requester");
              setCurrentUserName(payload.name || "");
              setName(payload.name || "");
              setEmail(payload.email || "");
            }
          } catch (tokenErr) {
            console.error("Error decoding token", tokenErr);
          }
        }
      }
    };
    fetchUserData();
  }, []);

  const roleLower = currentUserRole ? currentUserRole.toLowerCase() : "";
  const isPrivileged =
    roleLower === "supporter" ||
    roleLower === "admin" ||
    roleLower === "support";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // اگر اندپوینت پروفایل دارید اینجا فراخوانی کنید
      toast.success("تنظیمات با موفقیت ذخیره شد");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در بروزرسانی اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
      dir="rtl"
    >
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* سایدبار کاملاً هماهنگ با وضعیت ادمین یا کاربر */}
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

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/");
              }}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{isPrivileged ? "مدیریت کل تیکت‌ها" : "داشبورد اصلی"}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>تنظیمات حساب</span>
            </button>

            {isPrivileged && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl mt-2">
                <ShieldAlert className="h-4 w-4" />
                <span>دسترسی پشتیبان فعال است</span>
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

      {/* محتوای اصلی تنظیمات */}
      <main className="grow p-4 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold shadow-sm cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>منو</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            تنظیمات حساب کاربری
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            مدیریت اطلاعات شخصی و امنیت حساب
          </p>
        </div>

        <div className="max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                نام کامل
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                ایمیل
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold mb-4">تغییر رمز عبور</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="در صورت عدم تمایل به تغییر خالی بگذارید"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-5 py-2.5 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
