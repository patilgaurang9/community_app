import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MemberCard from '../../components/MemberCard';
import FilterModal from '../../components/FilterModal';
import { Profile, getAllProfiles, createConnectionRequest, getConnectionStatus } from '../../lib/database';
import { useAuth } from '../../lib/AuthContext';

export default function Members() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Data state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // Connection state
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'none' | 'pending' | 'connected'>>({});
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());

  // Fetch all profiles on mount
  const fetchProfiles = async () => {
    try {
      const data = await getAllProfiles();
      setProfiles(data);
      
      // Fetch connection statuses for all profiles
      const statuses: Record<string, 'none' | 'pending' | 'connected'> = {};
      for (const profile of data) {
        const status = await getConnectionStatus(profile.id);
        statuses[profile.id] = status;
      }
      setConnectionStatuses(statuses);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfiles();
  };

  const handleApplyFilter = (tag: string) => {
    setSelectedTag(tag);
    setIsFilterModalOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedTag('All');
  };

  // Step 1: Apply tag filter (Quick Search by tag)
  const filteredByTag = useMemo(() => {
    if (selectedTag === 'All') {
      return profiles; // Show all when "All" is selected
    }

    // Filter profiles that have the selected tag
    return profiles.filter((profile) => {
      const tags = profile.tags || [];
      return tags.some(tag => 
        tag.toLowerCase() === selectedTag.toLowerCase()
      );
    });
  }, [profiles, selectedTag]);

  // Step 2: Apply search (prioritizes tags, then searches other fields)
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByTag;
    }

    const query = searchQuery.toLowerCase();
    return filteredByTag.filter((profile) => {
      // Check name
      const fullName = profile.full_name?.toLowerCase() || '';
      if (fullName.includes(query)) return true;

      // Check job title
      const jobTitle = profile.job_title?.toLowerCase() || '';
      if (jobTitle.includes(query)) return true;

      // Check company
      const company = profile.company?.toLowerCase() || '';
      if (company.includes(query)) return true;

      // IMPORTANT: Check tags array (prioritized)
      const matchesTag = profile.tags?.some(tag => 
        tag.toLowerCase().includes(query)
      );
      if (matchesTag) return true;

      // Check skills as fallback
      const skills = profile.skills?.map((s) => s.toLowerCase()).join(' ') || '';
      if (skills.includes(query)) return true;

      return false;
    });
  }, [filteredByTag, searchQuery]);

  // Connection handlers
  const handleConnect = async (profileId: string) => {
    setConnectingIds((prev) => new Set(prev).add(profileId));

    const result = await createConnectionRequest(profileId);

    if (result.success) {
      setConnectionStatuses((prev) => ({
        ...prev,
        [profileId]: 'pending',
      }));
    } else {
      console.error('Failed to create connection:', result.error);
    }

    setConnectingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(profileId);
      return newSet;
    });
  };

  const handleMemberPress = (memberId: string) => {
    router.push(`/member/${memberId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#71717A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members"
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
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Ionicons name="funnel-outline" size={22} color="#FFFFFF" />
          {selectedTag !== 'All' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Members List */}
      {filteredProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Members Found</Text>
          <Text style={styles.emptyText}>
            {selectedTag !== 'All'
              ? `No members with "${selectedTag}" tag`
              : searchQuery
              ? 'No members match your search'
              : 'No members available'}
          </Text>
          {selectedTag !== 'All' && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
              <Text style={styles.clearButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemberCard
              profile={item}
              connectionStatus={connectionStatuses[item.id] || 'none'}
              onPress={() => handleMemberPress(item.id)}
              onConnect={() => handleConnect(item.id)}
              isConnecting={connectingIds.has(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedTag={selectedTag}
        onSelectTag={handleApplyFilter}
      />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
