import { Menu, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/axiosInstance";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export const SettingsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // همگام‌سازی کامل فیلدها به محض آماده شدن اطلاعات کاربر از AuthContext
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch("/auth/update-profile", {
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      toast.success("تنظیمات با موفقیت ذخیره شد");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در بروزرسانی اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return null; // یا یک لودینگ ساده تا اطلاعات کانتکست خوانده شود
  }

  return (
    <div
      className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
      dir="rtl"
    >
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

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
                    رمز عبور فعلی
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="رمز عبور فعلی..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="رمز عبور جدید..."
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
