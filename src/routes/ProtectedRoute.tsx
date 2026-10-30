import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // تا زمانی که وضعیت لودینگ توکن بررسی می‌شود، می‌توانید یک لودر ساده نشان دهید
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        در حال بارگذاری...
      </div>
    );
  }

  // اگر کاربر لاگین نکرده بود، هدایت به صفحه لاگین
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
