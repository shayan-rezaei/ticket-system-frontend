import { Bell, Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "../context/ThemeContext";

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-8 backdrop-blur-md transition-colors duration-300">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          پنل مدیریت
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* دکمه تم */}
        <div className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1 shadow-sm">
          <button
            onClick={() => setTheme("light")}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              theme === "system"
                ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* دکمه نوتیفیکیشن نمایشی */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
