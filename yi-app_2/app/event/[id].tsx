import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time: string;
  location?: string;
  image_url?: string;
  is_featured: boolean;
  host_id?: string;
}

interface EventHost {
  id: string;
  full_name: string;
  avatar_url?: string;
}

type RSVPStatus = 'going' | 'interested' | null;

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/updates');
    }
  };

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [host, setHost] = useState<EventHost | null>(null);
  const [currentStatus, setCurrentStatus] = useState<RSVPStatus>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch event data
  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    if (!id) return;

    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch host details if host_id exists
      if (eventData?.host_id) {
        const { data: hostData, error: hostError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', eventData.host_id)
          .single();

        if (!hostError && hostData) {
          setHost(hostData);
        }
      }

      // Fetch current user's RSVP status
      if (user) {
        const { data: rsvpData, error: rsvpError } = await supabase
          .from('event_rsvps')
          .select('status')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single();

        if (!rsvpError && rsvpData) {
          setCurrentStatus(rsvpData.status as RSVPStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (newStatus: 'going' | 'interested') => {
    if (!user || !event) {
      Alert.alert('Error', 'You must be logged in to RSVP');
      return;
    }

    setIsUpdating(true);

    try {
      // If clicking the same status, toggle OFF (delete the RSVP)
      if (currentStatus === newStatus) {
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setCurrentStatus(null);
        Alert.alert('Success', 'RSVP removed');
      } else {
        // Otherwise, upsert the new status
        const { error } = await supabase
          .from('event_rsvps')
          .upsert({
            event_id: event.id,
            user_id: user.id,
            status: newStatus,
          });

        if (error) throw error;

        setCurrentStatus(newStatus);
        Alert.alert(
          'Success',
          newStatus === 'going' ? "You're going to this event!" : "You're interested in this event!"
        );
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date and time
  const formatDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const dayAndDate = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const startTimeStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const endTimeStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${dayAndDate} • ${startTimeStr} - ${endTimeStr}`;
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!event) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorText}>This event could not be loaded.</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholderHero]}>
            <Ionicons name="calendar" size={64} color="#52525B" />
          </View>
        )}

        {/* Dark overlay for better text readability */}
        <View style={styles.heroOverlay} />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonBlur}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Category Badge */}
        {event.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Host Row */}
        {host && (
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              {host.avatar_url ? (
                <Image source={{ uri: host.avatar_url }} style={styles.hostAvatarImage} />
              ) : (
                <Ionicons name="person" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.hostText}>Hosted by {host.full_name}</Text>
          </View>
        )}

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          {/* Date & Time Row */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.infoText}>{formatDateTime(event.start_time, event.end_time)}</Text>
          </View>

          {/* Location Row */}
          {event.location && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* Bottom spacing for sticky footer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Footer - Action Buttons */}
      <View style={styles.stickyFooter}>
        {/* Interested Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.interestedButton,
            currentStatus === 'interested' && styles.interestedButtonActive,
          ]}
          onPress={() => handleRSVP('interested')}
          disabled={isUpdating}
        >
          {isUpdating && currentStatus === 'interested' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={currentStatus === 'interested' ? 'star' : 'star-outline'}
                size={20}
                color={currentStatus === 'interested' ? '#000000' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  currentStatus === 'interested' && styles.actionButtonTextActive,
                ]}
              >
                Interested
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* RSVP / Going Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.goingButton]}
          onPress={() => handleRSVP('going')}
          disabled={isUpdating}
        >
          {isUpdating && currentStatus !== 'interested' ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <Ionicons
                name={currentStatus === 'going' ? 'checkmark-circle' : 'ticket-outline'}
                size={20}
                color="#000000"
              />
              <Text style={styles.goingButtonText}>
                {currentStatus === 'going' ? "You're Going!" : 'RSVP'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    padding: 20,
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
    marginBottom: 32,
  },
  backButtonError: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderHero: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
  },
  categoryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120, // Space for sticky footer
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 36,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52525B',
  },
  hostAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  hostText: {
    color: '#A1A1AA',
    fontSize: 15,
    fontWeight: '500',
  },
  infoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    color: '#E4E4E7',
    fontSize: 15,
    lineHeight: 24,
    paddingTop: 8,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#D4D4D8',
    fontSize: 16,
    lineHeight: 26,
  },
  bottomSpacer: {
    height: 40,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  interestedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  interestedButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonTextActive: {
    color: '#000000',
  },
  goingButton: {
    backgroundColor: '#10B981',
  },
  goingButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
