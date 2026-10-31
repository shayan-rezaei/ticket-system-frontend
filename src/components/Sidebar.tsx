import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [userRole, setUserRole] = useState<string>("requester");

  useEffect(() => {
    // خواندن مستقیم و فوری نقش از توکن موجود در localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token Payload in Sidebar:", payload); // برای بررسی در کنسول F12
        if (payload && payload.role) {
          setUserRole(payload.role);
        }
      } catch (e) {
        console.error("Error decoding token in Sidebar", e);
      }
    }
  }, []);

  // بررسی دقیق نقش (تبدیل به حروف کوچک و حذف فاصله‌های اضافی)
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : "";

  // هر نقشی که غیر از کاربر عادی باشد را به عنوان ادمین/پشتیبان شناسایی می‌کنیم
  const isPrivileged =
    normalizedRole === "supporter" ||
    normalizedRole === "admin" ||
    normalizedRole === "support" ||
    normalizedRole === "administrator" ||
    normalizedRole !== "requester"; // اگر نقشی غیر از requester بود قطعاً پشتیبان است

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isDashboardActive = location.pathname === "/";
  const isSettingsActive = location.pathname === "/settings";

  return (
    <>
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

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
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                isDashboardActive
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{isPrivileged ? "مدیریت کل تیکت‌ها" : "داشبورد اصلی"}</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/settings");
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                isSettingsActive
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300"
              }`}
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
    </>
  );
};
