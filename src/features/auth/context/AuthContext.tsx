import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../config/supabase";
import { getCurrentProfile, logoutUser } from "../services/auth.service";
import type { UserProfile } from "../types/auth.types";

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    try {
      const currentProfile = await getCurrentProfile();
      setProfile(currentProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);

        if (data.session) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setSession(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      setTimeout(async () => {
        await refreshProfile();
        setLoading(false);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAuthenticated: Boolean(session),
      isAdmin: profile?.role === "admin",
      refreshProfile,
      logout,
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}