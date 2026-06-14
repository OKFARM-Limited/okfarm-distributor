import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'assistant' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.role as UserRole) || 'assistant';
}

async function fetchProfile(userId: string): Promise<{ display_name: string | null; avatar_url: string | null; email: string | null }> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, email')
    .eq('user_id', userId)
    .maybeSingle();
  return data || { display_name: null, avatar_url: null, email: null };
}

async function buildUser(supabaseUser: SupabaseUser): Promise<User> {
  const [role, profile] = await Promise.all([
    fetchUserRole(supabaseUser.id),
    fetchProfile(supabaseUser.id),
  ]);
  const name = profile.display_name || supabaseUser.email?.split('@')[0] || 'User';
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name,
    role,
    avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Auth state listener is the SINGLE source of truth for user state.
    // It fires for INITIAL_SESSION (on load), SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        // setTimeout avoids a known Supabase client deadlock when making
        // DB calls (fetchUserRole/fetchProfile) inside the auth callback.
        setTimeout(async () => {
          if (!mounted) return;
          const appUser = await buildUser(session.user);
          if (mounted) {
            setUser(appUser);
            setIsLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Fallback: if the auth listener hasn't fired within 3s, stop the loading spinner.
    // This handles edge cases where onAuthStateChange may not fire (e.g., no session at all).
    const timeout = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);



  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
