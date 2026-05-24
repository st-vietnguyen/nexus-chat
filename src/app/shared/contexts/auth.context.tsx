import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { AuthError, type User } from '@supabase/supabase-js';
import { supabase } from '@app/libs/supabase/client';
import { onAuthStateChange, signOut } from '@core/services/auth.service';

const VERIFY_EVENTS = new Set(['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED']);

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  clearUserSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  clearUserSession: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      if (!session) {
        setUser(null);
      } else if (VERIFY_EVENTS.has(event)) {
        const { data, error } = await supabase.auth.getUser();
        if (error instanceof AuthError && error.status === 401) {
          setUser(null);
        } else {
          setUser(data.user ?? session.user);
        }
      } else {
        setUser(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearUserSession = useCallback(async () => {
    await signOut();
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, clearUserSession }),
    [user, isLoading, clearUserSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
