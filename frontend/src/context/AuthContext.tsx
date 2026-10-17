import React, { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { getJWT, setJWT, removeJWT } from "../api/utils";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

let logoutTimer: ReturnType<typeof setTimeout>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const currentToken = () => {
  const token = getJWT();
  if (!token) return null;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp || exp * 1000 <= Date.now()) {
      removeJWT();
      return null;
    }
    return token;
  } catch {
    removeJWT();
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(currentToken);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  const startLogoutTimer = (token: string) => {
    const { exp } = jwtDecode<{ exp: number }>(token);
    const expirationTime = exp * 1000 - Date.now();
    logoutTimer = setTimeout(() => {
      logout();
    }, expirationTime);
  };

  const login = (newToken: string) => {
    setJWT(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    startLogoutTimer(newToken);
  };

  const logout = () => {
    removeJWT();
    setToken(null);
    setIsAuthenticated(false);
    clearTimeout(logoutTimer);
    window.location.href = "/login";
  };

  React.useEffect(() => {
    if (token) {
      startLogoutTimer(token);
    }
    return () => clearTimeout(logoutTimer);
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
