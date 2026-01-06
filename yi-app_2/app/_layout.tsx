import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Profile Gatekeeper Component
 * Strictly enforces profile completion before allowing access to (tabs) group
 */
function ProfileGatekeeper({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading: authLoading, isProfileComplete } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // STRICT REDIRECT RULES based on profile completion status
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Wait for profile check to complete (isProfileComplete must not be null)
    if (session && isProfileComplete === null) {
      console.log('ProfileGatekeeper: Waiting for profile check to complete...');
      return;
    }

    console.log('Current Segments:', segments);
    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === 'login' || currentSegment === 'signup';
    const inCompleteProfile = currentSegment === 'complete-profile';
    const inTabs = currentSegment === '(tabs)';

    console.log('ProfileGatekeeper: Checking redirect rules', {
      hasSession: !!session,
      isProfileComplete,
      currentSegment,
      segmentsLength: segments.length,
      inAuthGroup,
      inCompleteProfile,
      inTabs,
    });

    // STRICT REDIRECT RULE 1: User logged in BUT profile is incomplete
    if (session && isProfileComplete === false) {
      // If user is not already on complete-profile screen, redirect them
      if (currentSegment !== 'complete-profile') {
        console.log('ProfileGatekeeper: Profile incomplete, redirecting to /complete-profile');
        router.replace('/complete-profile');
      }
      return;
    }

    // STRICT REDIRECT RULE 2: User logged in AND profile is complete
    if (session && isProfileComplete === true) {
      // MISSING CASE: If stuck at root (segments.length === 0), force push to home
      if (segments.length === 0) {
        console.log('ProfileGatekeeper: Stuck at root -> Force Pushing to Home');
        router.replace('/(tabs)/home');
        return;
      }
      
      // If user is in auth (login) or complete-profile screens, redirect to home
      if (inAuthGroup || inCompleteProfile) {
        console.log('ProfileGatekeeper: Profile complete, redirecting to home');
        router.replace('/(tabs)/home');
      }
      return;
    }

    // No session - allow navigation (AuthContext handles unauthenticated redirects)
  }, [session, isProfileComplete, segments, router, authLoading]);

  console.log('ProfileGatekeeper render:', {
    authLoading,
    hasSession: !!session,
    isProfileComplete,
    segments: segments[0],
  });

  // PREVENT FLASHING: Keep loading indicator visible until profile check is complete
  // Do NOT render <Slot/> until we know for sure if the profile is complete or not
  if (authLoading || (session && isProfileComplete === null)) {
    console.log('ProfileGatekeeper: Showing loading - waiting for profile check', {
      authLoading,
      hasSession: !!session,
      isProfileComplete,
    });
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // STRICT BLOCK: If user tries to access tabs with incomplete profile, show loading
  if (session && isProfileComplete === false && segments[0] === '(tabs)') {
    console.log('ProfileGatekeeper: Blocking tabs access - profile incomplete');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  console.log('ProfileGatekeeper: Allowing render');
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  console.log('Rendering Root Layout');
  
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <ProfileGatekeeper>
          <Slot />
        </ProfileGatekeeper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000', // Explicit black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 16,
  },
});

