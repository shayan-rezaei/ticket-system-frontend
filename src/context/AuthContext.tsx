import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // استخراج خودکار اطلاعات کاربر و نقش از توکن JWT
  const decodeUserFromToken = (tokenStr: string): User | null => {
    try {
      const payload = JSON.parse(atob(tokenStr.split(".")[1]));
      return {
        id: payload.userId || payload.id || "",
        email: payload.email || "",
        name: payload.name || payload.email?.split("@")[0] || "",
        role: payload.role || payload.userRole || "requester",
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          setUser(decodeUserFromToken(storedToken));
        }
      } else {
        const decoded = decodeUserFromToken(storedToken);
        if (decoded) setUser(decoded);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    const finalUser = {
      ...userData,
      role: userData.role || decodeUserFromToken(newToken)?.role || "requester",
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
