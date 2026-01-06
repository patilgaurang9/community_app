import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function TabsLayout() {
  const router = useRouter();
  const { user, session, isLoading: authLoading } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      // CRITICAL: Wait for auth to finish loading
      if (authLoading) {
        console.log('TabsLayout: Waiting for auth to finish loading...');
        return;
      }

      // If no user/session, redirect will be handled by AuthContext
      if (!user || !session) {
        console.log('TabsLayout: No user/session, blocking tabs');
        setIsCheckingProfile(false);
        setIsProfileComplete(false);
        return;
      }

      // Reset state and start checking
      setIsProfileComplete(false);
      setIsCheckingProfile(true);

      try {
        // CRITICAL: Query profile directly using supabase - wait for fetch to complete
        console.log('TabsLayout: Fetching profile from database...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // CRITICAL: Only make navigation decision AFTER fetch completes
        if (error) {
          console.error('TabsLayout: Database error:', error);
          // On error, redirect to complete-profile to be safe
          setIsProfileComplete(false);
          router.replace('/complete-profile');
          return;
        }

        console.log('TabsLayout: Profile fetch complete:', { 
          dataExists: !!data, 
          hasFullName: !!(data?.full_name) 
        });

        // Check if profile exists AND has full_name
        if (!data || !data.full_name) {
          // Profile is missing or incomplete - redirect immediately
          console.log('TabsLayout: Profile incomplete, redirecting to complete-profile');
          setIsProfileComplete(false);
          router.replace('/complete-profile');
          return;
        }

        // Profile is complete - allow access to tabs
        console.log('TabsLayout: Profile complete, allowing access to tabs');
        setIsProfileComplete(true);
      } catch (err) {
        console.error('TabsLayout: Exception:', err);
        // On exception, redirect to complete-profile to be safe
        setIsProfileComplete(false);
        router.replace('/complete-profile');
      } finally {
        // CRITICAL: Only set checking to false AFTER all async operations complete
        console.log('TabsLayout: Profile check complete');
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [session]); // Only re-run when session changes, not on authLoading or navigation

  // Show loading spinner while checking profile
  if (authLoading || isCheckingProfile || !isProfileComplete) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000000',
          borderBottomWidth: 1,
          borderBottomColor: '#27272A',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>YI</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#27272A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: 'Benefits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="birthdays"
        options={{
          title: 'Birthdays',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name = "cake" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Buzz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerRight: {
    marginRight: 16,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#52525B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 16,
  },
});
