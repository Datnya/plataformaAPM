"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "ADMIN" | "CONSULTOR" | "CLIENTE" | "ESPECIALISTA";

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
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("CLIENTE");
  const [userName, setUserName] = useState("Usuario APM");
  const [userId, setUserId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedConsultantId, setSelectedConsultantId] = useState<
    string | null
  >(null);

  const loadProfile = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("users")
      .select("id, name, role, status")
      .eq("id", uid)
      .single();

    if (profile && profile.status === "ACTIVO") {
      setUserId(profile.id);
      setUserName(profile.name);
      setUserRole(profile.role as UserRole);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    try {
      const supabase = createClient();

      // Check existing session on mount with a timeout
      // If Supabase is paused, the fetch can hang for a long time.
      const checkAuth = supabase.auth.getUser();
      const timeout = new Promise<{ data: { user: null }, error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase auth check timed out (likely paused).")), 8000)
      );

      Promise.race([checkAuth, timeout])
        .then(async ({ data: { user }, error }) => {
          if (error) {
            await supabase.auth.signOut().catch(() => {});
            setIsLoading(false);
          } else if (user) {
            loadProfile(user.id).finally(() => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error checking auth session:", err);
          setIsLoading(false);
        });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setIsAuthenticated(false);
          setUserId("");
          setUserName("Usuario APM");
          setUserRole("CLIENTE");
          setCurrentView("dashboard");
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Critical error initializing Supabase client:", error);
      setIsLoading(false);
    }
  }, [loadProfile]);



  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId("");
    setUserName("Usuario APM");
    setUserRole("CLIENTE");
    setCurrentView("dashboard");
    setSelectedConsultantId(null);
  }, []);

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
        logout,
        isLoading,
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
