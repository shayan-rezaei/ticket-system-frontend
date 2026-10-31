import {
  Edit,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Shield,
  ShieldAlert,
  Sun,
  Ticket as TicketIcon,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const UsersManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("requester");
  const [submitting, setSubmitting] = useState(false);

  // بررسی نقش کاربر از روی توکن
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload.role ? payload.role.toUpperCase() : "";

        if (userRole !== "ADMIN") {
          toast.error("شما دسترسی به این صفحه را ندارید.");
          navigate("/");
        }
      } catch (e) {
        console.error("Token error", e);
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در دریافت لیست کاربران");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("requester");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, {
          name,
          email,
          role,
          password,
        });

        toast.success("کاربر با موفقیت ویرایش شد");
      } else {
        await api.post("/users", { name, email, password, role });
        toast.success("کاربر جدید با موفقیت ساخته شد");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در انجام عملیات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("کاربر حذف شد");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "خطا در حذف کاربر");
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

      {/* سایدبار */}
      <aside
        className={`w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shrink-0 h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 right-0 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          {/* لوگو و عنوان */}
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
                  پنل مدیریت و پشتیبانی
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

          {/* منوی اصلی */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/");
              }}
              className="flex w-full items-center gap-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>مدیریت کل تیکت‌ها</span>
            </button>

            {/* آیتم فعال مدیریت کاربران */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer text-zinc-900 dark:text-zinc-100"
            >
              <Users className="h-4 w-4" />
              <span>مدیریت کاربران</span>
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

            {/* نشان دسترسی ادمین */}
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl mt-2">
              <ShieldAlert className="h-4 w-4" />
              <span>دسترسی ادمین فعال است</span>
            </div>
          </nav>
        </div>

        {/* تنظیمات پوسته و خروج */}
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

      {/* محتوای اصلی */}
      <main className="grow p-4 md:p-10 space-y-8 overflow-y-auto">
        {/* دکمه منوی موبایل */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold shadow-sm cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>منو</span>
          </button>
        </div>

        {/* عنوان صفحه و دکمه افزودن */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              مدیریت کاربران
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              ساخت، ویرایش و حذف حساب‌های کاربری و ادمین
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>افزودن کاربر جدید</span>
          </button>
        </div>

        {/* جدول کاربران */}
        {loading ? (
          <div className="text-center py-12 text-zinc-400">
            در حال بارگذاری...
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold text-zinc-500">
                    <th className="py-3.5 px-4">نام کاربر</th>
                    <th className="py-3.5 px-4">ایمیل</th>
                    <th className="py-3.5 px-4">نقش سیستم</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-all"
                    >
                      <td className="py-4 px-4 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        {u.name}
                      </td>

                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                        {u.email}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : u.role === "supporter"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all cursor-pointer"
                            title="ویرایش"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* مدال ساخت و ویرایش کاربر */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-base font-bold">
                  {editingUserId ? "ویرایش اطلاعات کاربر" : "ساخت کاربر جدید"}
                </h3>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    نام کامل
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    رمز عبور{" "}
                    {editingUserId && "(در صورت عدم تغییر خالی بگذارید)"}
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingUserId}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    نقش کاربر
                  </label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-2.5 text-sm focus:outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="requester">کاربر عادی (Requester)</option>
                    <option value="supporter">پشتیبان (Supporter)</option>
                    <option value="admin">مدیر کل (Admin)</option>
                  </select>
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
                    {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
