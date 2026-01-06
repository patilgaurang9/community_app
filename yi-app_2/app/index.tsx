import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, session, isLoading, isProfileComplete } = useAuth();

  // If user is logged in and profile is complete, redirect to home
  if (session && isProfileComplete === true) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If user is logged in but profile is incomplete, redirect to complete-profile
  if (session && isProfileComplete === false) {
    return <Redirect href="/complete-profile" />;
  }

  // If user is logged in but profile check is still loading, show loading
  if (isLoading || (session && isProfileComplete === null)) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Show landing page if not logged in
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Welcome to Community</Text>
          <Text style={styles.subtitle}>
            Connect with professionals and grow your network
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Log In"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Create Account"
            onPress={() => router.push('/signup')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 28,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
});

