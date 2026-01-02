import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import FloatingChatButton from '../../components/FloatingChatButton';

interface Profile {
  id: string;
  full_name: string;
  company?: string;
  avatar_url?: string;
  dob?: string;
  phone_number?: string;
}

type FilterType = 'today' | 'week' | 'month';

export default function Birthdays() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('today');
  const [counts, setCounts] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    fetchBirthdays();
  }, []);

  useEffect(() => {
    filterBirthdays();
  }, [profiles, selectedFilter]);

  const fetchBirthdays = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, company, avatar_url, dob, phone_number')
        .not('dob', 'is', null)
        .order('full_name', { ascending: true });

      if (error) throw error;

      setProfiles(data || []);
      calculateCounts(data || []);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateCounts = (allProfiles: Profile[]) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();
    
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    allProfiles.forEach(profile => {
      if (!profile.dob) return;

      const dob = new Date(profile.dob);
      const birthMonth = dob.getMonth() + 1;
      const birthDate = dob.getDate();

      // Check if birthday is today
      if (birthMonth === todayMonth && birthDate === todayDate) {
        todayCount++;
      }

      // Check if birthday is this month
      if (birthMonth === todayMonth) {
        monthCount++;
      }

      // Check if birthday is within next 7 days
      const daysUntilBirthday = getDaysUntilBirthday(dob);
      if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
        weekCount++;
      }
    });

    setCounts({ today: todayCount, week: weekCount, month: monthCount });
  };

  const getDaysUntilBirthday = (dob: Date): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const nextBirthday = new Date(
      currentYear,
      dob.getMonth(),
      dob.getDate()
    );

    // If birthday has passed this year, check next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const filterBirthdays = () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    let filtered: Profile[] = [];

    profiles.forEach(profile => {
      if (!profile.dob) return;

      const dob = new Date(profile.dob);
      const birthMonth = dob.getMonth() + 1;
      const birthDate = dob.getDate();

      if (selectedFilter === 'today') {
        // Show only today's birthdays
        if (birthMonth === todayMonth && birthDate === todayDate) {
          filtered.push(profile);
        }
      } else if (selectedFilter === 'week') {
        // Show birthdays in the next 7 days
        const daysUntilBirthday = getDaysUntilBirthday(dob);
        if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
          filtered.push(profile);
        }
      } else if (selectedFilter === 'month') {
        // Show all birthdays this month
        if (birthMonth === todayMonth) {
          filtered.push(profile);
        }
      }
    });

    // Sort by date within the month
    filtered.sort((a, b) => {
      const dateA = new Date(a.dob!).getDate();
      const dateB = new Date(b.dob!).getDate();
      return dateA - dateB;
    });

    setFilteredProfiles(filtered);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBirthdays();
  };

  const formatBirthdayDate = (dob: string): string => {
    const date = new Date(dob);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const isBirthdayToday = (dob: string): boolean => {
    const today = new Date();
    const birthday = new Date(dob);
    return today.getMonth() === birthday.getMonth() && 
           today.getDate() === birthday.getDate();
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleMessage = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    }
  };

  const renderBirthdayCard = ({ item }: { item: Profile }) => {
    const isToday = isBirthdayToday(item.dob!);

    return (
      <View style={styles.birthdayCard}>
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={30} color="#71717A" />
              </View>
            )}
            <View style={styles.cakeIconBadge}>
              <Ionicons name="gift-sharp" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
              {isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today!</Text>
                </View>
              )}
            </View>
            <Text style={styles.company} numberOfLines={1}>{item.company || 'No company'}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color="#71717A" />
              <Text style={styles.dateText}>{formatBirthdayDate(item.dob!)}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCall(item.phone_number)}
              activeOpacity={0.6}
            >
              <View style={styles.callButton}>
                <Ionicons name="call" size={18} color="#10B981" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleMessage(item.phone_number)}
              activeOpacity={0.6}
            >
              <View style={styles.messageButton}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#10B981" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {counts.today > 0 && (
        <View style={styles.todayHighlightCard}>
          <View style={styles.giftIconBox}>
            <Ionicons name="gift-sharp" size={28} color="#FFFFFF" />
            <View style={styles.confetti1} />
            <View style={styles.confetti2} />
            <View style={styles.confetti3} />
          </View>
          <View style={styles.todayHighlightText}>
            <Text style={styles.todayHighlightTitle}>
              {counts.today} Birthday{counts.today > 1 ? 's' : ''} Today!
            </Text>
            <Text style={styles.todayHighlightSubtitle}>Send them your wishes!</Text>
          </View>
          <Ionicons name="sparkles" size={20} color="#F59E0B" />
        </View>
      )}

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'today' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('today')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'today' && styles.filterTabTextActive,
            ]}
          >
            Today
          </Text>
          {counts.today > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{counts.today}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'week' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('week')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'week' && styles.filterTabTextActive,
            ]}
          >
            This Week
          </Text>
          {counts.week > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>({counts.week})</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'month' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('month')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'month' && styles.filterTabTextActive,
            ]}
          >
            This Month
          </Text>
          {counts.month > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>({counts.month})</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProfiles}
        renderItem={renderBirthdayCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={60} color="#52525B" />
            <Text style={styles.emptyText}>
              No birthdays {selectedFilter === 'today' ? 'today' : `this ${selectedFilter}`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
          />
        }
      />
      
      <FloatingChatButton />
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
    backgroundColor: '#000000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  todayHighlightCard: {
    backgroundColor: '#422D1E',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  giftIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F97316',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  confetti1: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#FDE047',
    borderRadius: 2.5,
    top: 6,
    right: 6,
    transform: [{ rotate: '45deg' }],
  },
  confetti2: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#FEF3C7',
    borderRadius: 2.5,
    bottom: 8,
    left: 6,
    transform: [{ rotate: '-20deg' }],
  },
  confetti3: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FBBF24',
    borderRadius: 2,
    top: 12,
    left: 10,
  },
  todayHighlightText: {
    flex: 1,
  },
  todayHighlightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  todayHighlightSubtitle: {
    fontSize: 13,
    color: '#D4D4D8',
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#18181B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: '#27272A',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 2,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },
  birthdayCard: {
    marginBottom: 10,
    backgroundColor: '#18181B',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#27272A',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27272A',
  },
  cakeIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    backgroundColor: '#F97316',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#18181B',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  todayBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  company: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 5,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 8,
  },
  actionButton: {
    // Container for touch
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#052E1C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  messageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#052E1C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#71717A',
    fontWeight: '500',
  },
});

