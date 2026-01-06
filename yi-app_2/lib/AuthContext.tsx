import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useRouter, useSegments } from 'expo-router';
import { getCurrentUserProfile } from './database';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isProfileComplete: boolean | null; // null = not checked yet, true = complete, false = incomplete
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isProfileComplete: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // CRITICAL: When session is found, IMMEDIATELY fetch profile
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('is_profile_complete')
            .eq('id', session.user.id)
            .maybeSingle();
          
          console.log('🔍 DB Profile Flag:', data?.is_profile_complete);
          
          // If data exists, use the flag. If no data, false.
          setIsProfileComplete(data?.is_profile_complete ?? false);
          console.log('AuthContext: Initial profile check complete:', { 
            isProfileComplete: data?.is_profile_complete ?? false 
          });
        } catch (error) {
          console.error('AuthContext: Error fetching initial profile:', error);
          setIsProfileComplete(false); // On error, assume incomplete
        }
      } else {
        setIsProfileComplete(null); // No session, reset to null
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // CRITICAL: When session changes, IMMEDIATELY fetch profile
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('is_profile_complete')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('🔍 DB Profile Flag:', data?.is_profile_complete);
            
            // If data exists, use the flag. If no data, false.
            setIsProfileComplete(data?.is_profile_complete ?? false);
            console.log('AuthContext: Profile check on auth change complete:', { 
              isProfileComplete: data?.is_profile_complete ?? false 
            });
          } catch (error) {
            console.error('AuthContext: Error fetching profile on auth change:', error);
            setIsProfileComplete(false); // On error, assume incomplete
          }
        } else {
          setIsProfileComplete(null); // No session, reset to null
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Profile completion check is now handled in the session useEffect above
  // This effect only handles redirects for unauthenticated users
  useEffect(() => {
    // CRITICAL: Wait for auth to finish loading before any checks
    if (isLoading) {
      console.log('AuthContext: Waiting for auth to finish loading...');
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const inIndex = segments[0] === 'index' || segments[0] === undefined;

    console.log('AuthContext: Auth loaded, checking user state...', { 
      user: !!user, 
      sessionUser: !!session?.user,
      segments: segments[0], 
      inAuthGroup, 
      inIndex
    });

    // CRITICAL: Check if user is logged in FIRST - if not, redirect to login
    if (!session?.user || !user) {
      console.log('AuthContext: No user/session detected');
      
      // If not in auth group or index, redirect to login
      if (!inAuthGroup && !inIndex) {
        console.log('AuthContext: No user, redirecting to login...');
        router.replace('/login');
      } else {
        console.log('AuthContext: No user, but already on auth/index page, allowing stay');
      }
      
      return;
    }
  }, [user, isLoading, router, segments]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};
