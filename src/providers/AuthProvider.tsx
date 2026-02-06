import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getEdgeFunctionUrl } from '../lib/supabaseClient';

type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  role: 'admin' | 'user';
  avatar_emoji: string;
  color: string;
  custom_avatar_url: string | null;
  theme: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (username: string, password: string, deviceId: string, deviceToken: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as UserProfile);
      });
  }, [user]);

  const signIn = useCallback(
    async (username: string, password: string, deviceId: string, deviceToken: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Supabase is not configured' };

      try {
        // Call the family_login edge function
        const res = await fetch(getEdgeFunctionUrl('family_login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, deviceId, deviceToken }),
        });

        const body = await res.json();
        if (!res.ok) {
          return { error: body.error || 'Login failed' };
        }

        // Set the session from the edge function response
        const { data, error } = await supabase.auth.setSession({
          access_token: body.access_token,
          refresh_token: body.refresh_token,
        });

        if (error) return { error: error.message };
        setSession(data.session);
        setUser(data.session?.user ?? null);
        return { error: null };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Network error';
        return { error: msg };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, isLoading, isConfigured: configured, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
