"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "ADMIN" | "CONSULTOR" | "CLIENTE";

interface AuthContextType {
  userRole: UserRole;
  userName: string;
  setUserName: (name: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedConsultantId: string | null;
  setSelectedConsultantId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("CONSULTOR");
  const [userName, setUserName] = useState("Usuario APM");
  const [userId, setUserId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userName,
        setUserName,
        userId,
        setUserId,
        setUserRole,
        isAuthenticated,
        setIsAuthenticated,
        currentView,
        setCurrentView,
        selectedConsultantId,
        setSelectedConsultantId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
