import axios from "axios";

// ایجاد نمونه آکسیوس با اتصال خودکار به آدرس محیط تولید یا لوکال
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ۱. اینترسپتور درخواست (Request Interceptor): الحاق خودکار توکن به هدرها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ۲. اینترسپتور پاسخ (Response Interceptor): مدیریت خطاهای سراسری (مثل منقضی شدن توکن)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // اگر توکن منقضی یا نامعتبر بود، پاک کردن اطلاعات و انتقال به صفحه لاگین
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
