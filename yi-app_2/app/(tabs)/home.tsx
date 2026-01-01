import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = React.useState(true);

  // Check if profile is complete on mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          setIsCheckingProfile(false);
          return;
        }

        // If profile is not complete, redirect to complete-profile
        if (!data?.is_profile_complete) {
          router.replace('/complete-profile');
          return;
        }

        setIsCheckingProfile(false);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

  // Show loading state while checking profile
  if (isCheckingProfile) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Discover upcoming events and activities</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Events Yet</Text>
          <Text style={styles.emptyText}>
            Check back soon for upcoming events and activities
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 8,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
