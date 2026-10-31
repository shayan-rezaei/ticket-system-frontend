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

  const decodeUserFromToken = (tokenStr: string): User | null => {
    try {
      const payload = JSON.parse(atob(tokenStr.split(".")[1]));
      const raw = payload.user || payload;
      return {
        id: raw.id || raw.userId || "",
        email: raw.email || "",
        name: raw.name || raw.email?.split("@")[0] || "",
        role: raw.role || raw.userRole || raw.permission || "requester",
      };
    } catch (e) {
      console.error("Token decode error:", e);
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      return decodeUserFromToken(storedToken);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const tokenUser = decodeUserFromToken(storedToken);
      if (tokenUser) {
        setUser(tokenUser);
      }

      try {
        const res = await api.get("/auth/me");
        const rawData = res.data?.data || res.data?.user || res.data || {};

        const serverUser: User = {
          id: rawData.id || rawData.userId || tokenUser?.id || "",
          email: rawData.email || tokenUser?.email || "",
          name: rawData.name || tokenUser?.name || "",
          role:
            tokenUser?.role && tokenUser.role !== "requester"
              ? tokenUser.role
              : rawData.role || rawData.userRole || "requester",
        };

        setUser(serverUser);
        localStorage.setItem("user", JSON.stringify(serverUser));
      } catch (error) {
        console.error("Failed to fetch /auth/me, keeping token state", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    const tokenParsed = decodeUserFromToken(newToken);
    const finalUser: User = {
      ...userData,
      role: userData.role || tokenParsed?.role || "requester",
    };
    setUser(finalUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(finalUser));
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
