import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/axiosInstance";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        // درخواست به /auth/me برای گرفتن نقش واقعی از دیتابیس
        const res = await api.get("/auth/me");
        console.log("Response from /auth/me:", res.data); // این را در F12 ببینید

        // استخراج امن اطلاعات از هر ساختاری که بک‌اند فرستاده باشد
        const rawData = res.data?.data || res.data?.user || res.data || {};

        const resolvedUser: User = {
          id: rawData.id || rawData.userId || "",
          email: rawData.email || "",
          name: rawData.name || "",
          role: rawData.role || rawData.userRole || "requester",
        };

        setUser(resolvedUser);
        localStorage.setItem("user", JSON.stringify(resolvedUser));
      } catch (error) {
        console.error(
          "Error fetching /auth/me, using fallback from token/storage",
          error,
        );

        // اگر سرور خطا داد، از توکن JWT استخراج می‌کنیم
        try {
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          const tokenData = payload.user || payload;
          const fallbackUser: User = {
            id: tokenData.id || tokenData.userId || "",
            email: tokenData.email || "",
            name: tokenData.name || "",
            role: tokenData.role || tokenData.userRole || "requester",
          };
          setUser(fallbackUser);
        } catch (e) {
          console.error("Failed to decode token fallback", e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
