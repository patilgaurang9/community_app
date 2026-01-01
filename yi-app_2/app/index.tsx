import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // If user is logged in, AuthContext will redirect to home
  // This is the Landing Page for non-logged-in users
  
  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Show landing page if not logged in
  if (!user) {
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

  // If user is logged in, show nothing (AuthContext will redirect)
  return null;
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

