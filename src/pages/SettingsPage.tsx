import {
  ArrowRight,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Save,
  Settings,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
  User,
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("USER");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserRole(payload.role || "USER");
        }

        const response = await api.get("/auth/me");
        setName(response.data.name || "");
        setEmail(response.data.email || "");
      } catch (err: any) {
        toast.error("خطا در دریافت اطلاعات کاربر");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload: any = { name, email };
      if (newPassword) {
        if (!currentPassword) {
          toast.error("برای تغییر رمز عبور، وارد کردن رمز فعلی الزامی است");
          setSubmitting(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await api.patch("/auth/update-profile", payload);
      toast.success("اطلاعات پروفایل با موفقیت به‌روزرسانی شد");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در ویرایش اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm"
        dir="rtl"
      >
        <div className="flex items-center gap-3 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>در حال بارگذاری اطلاعات تنظیمات...</span>
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
              className="flex w-full items-center gap-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
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

      {/* محتوای اصلی تنظیمات */}
      <main className="grow p-6 md:p-10 space-y-8 overflow-y-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              تنظیمات حساب کاربری
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              اطلاعات شخصی و رمز عبور خود را مدیریت کنید
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUpdateProfile}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">
              مشخصات عمومی
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">
              تغییر رمز عبور ( اختیاری )
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                رمز عبور فعلی
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                رمز عبور جدید
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-6 py-2.5 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
