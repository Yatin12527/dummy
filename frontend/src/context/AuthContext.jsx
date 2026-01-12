import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", {
      email,
      password,
    });
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/auth/signup", {
      name,
      email,
      password,
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);