import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import ActionIconButton from '../../components/ActionIconButton';
import Button from '../../components/ui/Button';
import { Profile, getProfile, getConnectionStatus, createConnectionRequest } from '../../lib/database';
import { useAuth } from '../../lib/AuthContext';

export default function MemberDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/updates');
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      const profileData = await getProfile(id);
      setProfile(profileData);

      const status = await getConnectionStatus(id);
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCall = () => {
    if (!profile?.phone_number) {
      Alert.alert('Not Available', 'Phone number is not available');
      return;
    }
    Linking.openURL(`tel:${profile.phone_number}`);
  };

  const handleWhatsApp = () => {
    if (!profile?.whatsapp_number && !profile?.phone_number) {
      Alert.alert('Not Available', 'WhatsApp number is not available');
      return;
    }
    const number = profile.whatsapp_number || profile.phone_number;
    Linking.openURL(`whatsapp://send?phone=${number}`);
  };

  const handleEmail = () => {
    if (!profile?.email) {
      Alert.alert('Not Available', 'Email is not available');
      return;
    }
    Linking.openURL(`mailto:${profile.email}`);
  };

  const handleLinkedIn = () => {
    if (!profile?.linkedin_url) {
      Alert.alert('Not Available', 'LinkedIn profile is not available');
      return;
    }
    Linking.openURL(profile.linkedin_url);
  };

  const handleConnect = async () => {
    if (!id || connectionStatus !== 'none') return;

    setIsConnecting(true);
    const result = await createConnectionRequest(id);

    if (result.success) {
      setConnectionStatus('pending');
      Alert.alert('Success', 'Connection request sent!');
    } else {
      Alert.alert('Error', result.error || 'Failed to send connection request');
    }
    setIsConnecting(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatBirthday = (dob?: string) => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Message';
      case 'pending':
        return 'Request Sent';
      case 'none':
      default:
        return 'Connect';
    }
  };

  const renderBio = () => {
    if (!profile?.bio) return null;

    const bioLength = profile.bio.length;
    const shouldTruncate = bioLength > 150;
    const displayBio = shouldTruncate && !showFullBio 
      ? profile.bio.substring(0, 150) + '...'
      : profile.bio;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{displayBio}</Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMoreText}>
              {showFullBio ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!profile) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Member Not Found</Text>
          <Text style={styles.errorText}>
            This member profile could not be loaded.
          </Text>
          <Button
            title="Go Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={handleBack}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Header */}
        <View style={styles.identityHeader}>
          <View style={styles.avatarLarge}>
            {profile.avatar_url ? (
              <Text style={styles.avatarEmoji}>👤</Text>
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(profile.full_name)}
              </Text>
            )}
          </View>
          <Text style={styles.name}>{profile.full_name}</Text>
          {(profile.job_title || profile.company) && (
            <Text style={styles.headline}>
              {profile.job_title}
              {profile.job_title && profile.company ? ' @ ' : ''}
              {profile.company}
            </Text>
          )}
          {profile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#A1A1AA" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <ActionIconButton
            iconName="call"
            onPress={handleCall}
            disabled={!profile.phone_number}
          />
          <ActionIconButton
            iconName="logo-whatsapp"
            onPress={handleWhatsApp}
            disabled={!profile.whatsapp_number && !profile.phone_number}
          />
          <ActionIconButton
            iconName="mail"
            onPress={handleEmail}
            disabled={!profile.email}
          />
          <ActionIconButton
            iconName="logo-linkedin"
            onPress={handleLinkedIn}
            disabled={!profile.linkedin_url}
          />
        </View>

        {/* Connection Status Button */}
        <Button
          title={getConnectionButtonText()}
          onPress={handleConnect}
          variant={connectionStatus === 'none' ? 'primary' : 'secondary'}
          isLoading={isConnecting}
          disabled={connectionStatus !== 'none'}
          style={styles.connectionButton}
        />

        {/* About Section */}
        {renderBio()}

        {/* Vitals Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
              <Text style={styles.vitalLabel}>Birthday</Text>
              <Text style={styles.vitalValue}>{formatBirthday(profile.dob)}</Text>
            </View>
            <View style={styles.vitalCard}>
              <Ionicons name="location-outline" size={24} color="#10B981" />
              <Text style={styles.vitalLabel}>Location</Text>
              <Text style={styles.vitalValue} numberOfLines={1}>
                {profile.location || 'N/A'}
              </Text>
            </View>
            <View style={styles.vitalCard}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <Text style={styles.vitalLabel}>Member Since</Text>
              <Text style={styles.vitalValue}>{formatDate(profile.member_since || profile.created_at)}</Text>
            </View>
            <View style={styles.vitalCard}>
              <Ionicons name="briefcase-outline" size={24} color="#8B5CF6" />
              <Text style={styles.vitalLabel}>Department</Text>
              <Text style={styles.vitalValue} numberOfLines={1}>
                {profile.department || profile.industry || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills / Tags */}
        {(profile.skills || profile.tags) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Interests</Text>
            <View style={styles.tagsContainer}>
              {profile.skills?.map((skill, index) => (
                <View key={`skill-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
              {profile.tags?.map((tag, index) => (
                <View key={`tag-${index}`} style={[styles.tag, styles.tagSecondary]}>
                  <Text style={styles.tagTextSecondary}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    minWidth: 200,
  },
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
  backButtonHeader: {
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
    paddingBottom: 40,
  },
  identityHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
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
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  headline: {
    color: '#A1A1AA',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  connectionButton: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  bioText: {
    color: '#D4D4D8',
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
  },
  vitalLabel: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  vitalValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#3F3F46',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagSecondary: {
    backgroundColor: '#27272A',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tagTextSecondary: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

