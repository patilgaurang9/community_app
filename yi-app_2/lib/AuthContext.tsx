import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useRouter, useSegments } from 'expo-router';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const inIndex = segments.length === 0 || segments[0] === 'index';
    const inCompleteProfile = segments[0] === 'complete-profile';

    console.log('Auth State:', { user: !!user, segments, inAuthGroup, inIndex, inCompleteProfile });

    // User is not logged in
    if (!user) {
      // Allow user to stay on index (landing page), login, or signup
      if (!inAuthGroup && !inIndex) {
        console.log('Redirecting to index (landing page)...');
        router.replace('/');
      }
      return;
    }

    // User is logged in - redirect to home if in auth group or index
    if (inAuthGroup || inIndex) {
      console.log('User logged in, redirecting to home');
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading, segments]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
