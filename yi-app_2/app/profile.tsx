import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface UserProfile {
  full_name?: string;
  email?: string;
  phone_number?: string;
  job_title?: string;
  company?: string;
  industry?: string;
  bio?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await supabase.auth.signOut();
              // AuthContext will handle redirect to login
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>
            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          {isLoadingProfile ? (
            <Text style={styles.loadingText}>Loading profile...</Text>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#A1A1AA" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>
              </View>

              {profile?.phone_number && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#A1A1AA" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone_number}</Text>
                  </View>
                </View>
              )}

              {profile?.job_title && (
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={20} color="#A1A1AA" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Job Title</Text>
                    <Text style={styles.infoValue}>{profile.job_title}</Text>
                  </View>
                </View>
              )}

              {profile?.company && (
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={20} color="#A1A1AA" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Company</Text>
                    <Text style={styles.infoValue}>{profile.company}</Text>
                  </View>
                </View>
              )}

              {profile?.industry && (
                <View style={styles.infoRow}>
                  <Ionicons name="layers-outline" size={20} color="#A1A1AA" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Industry</Text>
                    <Text style={styles.infoValue}>{profile.industry}</Text>
                  </View>
                </View>
              )}

              {profile?.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.infoLabel}>Bio</Text>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          isLoading={isLoading}
          variant="outline"
          style={styles.signOutButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    marginBottom: 32,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52525B',
    marginBottom: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  userEmail: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    color: '#71717A',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  bioSection: {
    paddingVertical: 16,
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 24,
    borderColor: '#EF4444',
  },
});

