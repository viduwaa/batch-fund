import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthState, AuthUser, Profile } from '@/lib/types';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (mounted) {
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              profile: profile as Profile,
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If user isn't fully loaded or ID mismatched, fetch profile
      if (!user || user.id !== session.user.id) {
        setIsLoading(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              profile: profile as Profile,
            });
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    
    if (error) {
      console.error('Login error:', error.message);
      return false; // Could throw to show toast in page, but sticking to boolean for now
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // authStateChange will catch this and set user to null
  }, []);

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.profile?.is_admin ?? false,
    isLoading,
    login,
    logout,
    toggleRole: () => { console.warn("toggleRole is disabled since auth is now live via Supabase"); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
