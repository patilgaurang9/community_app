import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import FloatingChatButton from '../../components/FloatingChatButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

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
  rsvp_count?: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Ref for FlatList
  const carouselRef = useRef<FlatList>(null);

  // Fetch events and RSVPs
  const fetchEvents = async () => {
    try {
      // Fetch all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch all RSVPs
      const { data: rsvpsData, error: rsvpsError } = await supabase
        .from('event_rsvps')
        .select('event_id, status')
        .eq('status', 'going');

      if (rsvpsError) throw rsvpsError;

      // Count RSVPs per event
      const rsvpCounts: Record<string, number> = {};
      rsvpsData?.forEach((rsvp) => {
        rsvpCounts[rsvp.event_id] = (rsvpCounts[rsvp.event_id] || 0) + 1;
      });

      // Attach RSVP counts to events
      const eventsWithCounts = eventsData?.map((event) => ({
        ...event,
        rsvp_count: rsvpCounts[event.id] || 0,
      })) || [];

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  // Filter out past events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.end_time) > now);
  }, [events]);

  // Featured events
  const featuredEvents = useMemo(() => {
    return upcomingEvents.filter((event) => event.is_featured);
  }, [upcomingEvents]);

  // Regular upcoming events (not featured)
  const regularEvents = useMemo(() => {
    return upcomingEvents.filter((event) => !event.is_featured);
  }, [upcomingEvents]);

  // Search filtered events
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return regularEvents;
    }

    const query = searchQuery.toLowerCase();
    return regularEvents.filter((event) => {
      const title = event.title?.toLowerCase() || '';
      const category = event.category?.toLowerCase() || '';
      return title.includes(query) || category.includes(query);
    });
  }, [regularEvents, searchQuery]);

  // Auto-rotation for Featured Carousel
  useEffect(() => {
    // Guard clause: Only auto-rotate if there are 2+ featured events
    if (featuredEvents.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % featuredEvents.length;
        
        // Scroll to next slide
        carouselRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        
        return nextIndex;
      });
    }, 3000); // 3 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleHostEvent = () => {
    router.push('/host-event');
  };

  const handleFilterPress = () => {
    Alert.alert('Date Filter', 'Date filtering coming soon!');
  };

  // Format date for badge
  const formatDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  // Format date/time display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#71717A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, hosts..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="options-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
        }
      >
        {/* Featured Events Hero Carousel */}
        {featuredEvents.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <View style={styles.carouselContainer}>
              <FlatList
                ref={carouselRef}
                data={featuredEvents}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                snapToInterval={CARD_WIDTH + 16} // Card width + gap
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onScrollBeginDrag={() => {
                  // Pause auto-rotation when user manually scrolls (optional UX enhancement)
                }}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
                  setActiveIndex(newIndex);
                }}
                renderItem={({ item: event }) => {
                  const dateBadge = formatDateBadge(event.start_time);
                  return (
                    <TouchableOpacity
                      style={styles.featuredCard}
                      onPress={() => handleEventPress(event.id)}
                      activeOpacity={0.9}
                    >
                      {event.image_url ? (
                        <Image source={{ uri: event.image_url }} style={styles.featuredImage} />
                      ) : (
                        <View style={[styles.featuredImage, styles.placeholderImage]}>
                          <Ionicons name="calendar" size={48} color="#52525B" />
                        </View>
                      )}
                      {/* Gradient Overlay */}
                      <View style={styles.featuredOverlay}>
                        <Text style={styles.featuredTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        <Text style={styles.featuredDate}>{formatDateTime(event.start_time)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
              
              {/* Dot Indicators */}
              {featuredEvents.length > 1 && (
                <View style={styles.dotsContainer}>
                  {featuredEvents.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activeIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Upcoming Events Main Feed */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={handleHostEvent}>
              <Text style={styles.hostEventText}>+ Host Event</Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Check back soon for upcoming events'}
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => {
              const dateBadge = formatDateBadge(event.start_time);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                  activeOpacity={0.7}
                >
                  {/* Left: Date Badge */}
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>{dateBadge.month}</Text>
                    <Text style={styles.dateDay}>{dateBadge.day}</Text>
                  </View>

                  {/* Center: Event Info */}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    {event.location && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color="#A1A1AA" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                    {/* Social Proof */}
                    <View style={styles.socialProof}>
                      <View style={styles.avatarStack}>
                        {/* Dummy avatars */}
                        <View style={[styles.avatar, { zIndex: 3 }]}>
                          <Ionicons name="person" size={12} color="#FFFFFF" />
                        </View>
                        <View style={[styles.avatar, styles.avatarOverlap, { zIndex: 2 }]}>
                          <Ionicons name="person" size={12} color="#FFFFFF" />
                        </View>
                        <View style={[styles.avatar, styles.avatarOverlap, { zIndex: 1 }]}>
                          <Ionicons name="person" size={12} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text style={styles.goingText}>{event.rsvp_count || 0}+ going</Text>
                    </View>
                  </View>

                  {/* Right: Thumbnail */}
                  <View style={styles.thumbnailContainer}>
                    {event.image_url ? (
                      <Image source={{ uri: event.image_url }} style={styles.thumbnail} />
                    ) : (
                      <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                        <Ionicons name="image-outline" size={24} color="#52525B" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
      
      <FloatingChatButton />
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
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  featuredSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: (CARD_WIDTH * 9) / 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#18181B',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredDate: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
    width: 24,
    borderRadius: 4,
  },
  upcomingSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostEventText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  dateBadge: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    borderRadius: 8,
    paddingVertical: 8,
  },
  dateMonth: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateDay: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#18181B',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  goingText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '500',
  },
  thumbnailContainer: {
    justifyContent: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
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
