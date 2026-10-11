import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import {
  supabase,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  initSupabaseClient,
} from '../lib/supabase';

// ID Admin Resmi Supabase yang ditentukan
export const OFFICIAL_ADMIN_ID = 'e11b4c30-7c9c-4605-8077-8ce535ba4a76';

export const checkIsAdmin = (u: User | null): boolean => {
  if (!u) return false;
  return (
    u.id === OFFICIAL_ADMIN_ID ||
    u.app_metadata?.role === 'admin' ||
    u.user_metadata?.role === 'admin' ||
    u.user_metadata?.is_admin === true
  );
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  config: { url: string; anonKey: string; isReal: boolean };
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | Error | null; data?: any; isAdmin: boolean }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | Error | null; data?: any }>;
  signOutUser: () => Promise<void>;
  updateSupabaseConfig: (url: string, anonKey: string) => void;
  resetSupabaseConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState(getSupabaseConfig());

  // Check initial session & subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const client = initSupabaseClient();
        const { data, error } = await client.auth.getSession();
        if (error) {
          console.warn('Initial session check notice:', error.message);
        }
        if (mounted) {
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
          } else {
            setUser(null);
            setSession(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error reading Supabase session:', err);
        if (mounted) setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to Supabase auth state updates
    const client = initSupabaseClient();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const client = initSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error, isAdmin: false };
      }

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      const isAdminUser = checkIsAdmin(data.user);
      return { error: null, data, isAdmin: isAdminUser };
    } catch (err: any) {
      return { error: err, isAdmin: false };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const client = initSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'patient',
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        if (data.session) setSession(data.session);
      }
      return { error: null, data };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOutUser = async () => {
    try {
      const client = initSupabaseClient();
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    }
    setUser(null);
    setSession(null);
  };

  const updateSupabaseConfig = (url: string, anonKey: string) => {
    saveSupabaseConfig(url, anonKey);
    setConfig(getSupabaseConfig());
  };

  const resetSupabaseConfig = () => {
    clearSupabaseConfig();
    setConfig(getSupabaseConfig());
  };

  // Determine if current user is an Admin
  const isAdmin = checkIsAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: config.isReal,
        isAdmin,
        config,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateSupabaseConfig,
        resetSupabaseConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
