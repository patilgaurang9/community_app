import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../lib/database';
import Button from './ui/Button';

interface MemberCardProps {
  profile: Profile;
  connectionStatus: 'none' | 'pending' | 'connected';
  onPress: () => void;
  onConnect: () => void;
  isConnecting?: boolean;
}

export default function MemberCard({
  profile,
  connectionStatus,
  onPress,
  onConnect,
  isConnecting = false,
}: MemberCardProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPrimaryTag = () => {
    if (profile.tags && profile.tags.length > 0) {
      return profile.tags[0];
    }
    if (profile.industry) {
      return profile.industry;
    }
    return null;
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'pending':
        return 'Request Sent';
      case 'none':
      default:
        return 'Connect';
    }
  };

  const isButtonDisabled = connectionStatus !== 'none';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          {profile.avatar_url ? (
            <Text style={styles.avatarText}>👤</Text>
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(profile.full_name)}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.full_name}
          </Text>
          
          {(profile.job_title || profile.company) && (
            <Text style={styles.role} numberOfLines={1}>
              {profile.job_title}
              {profile.job_title && profile.company ? ' @ ' : ''}
              {profile.company}
            </Text>
          )}

          {getPrimaryTag() && (
            <View style={styles.meta}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>#{getPrimaryTag()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.connectButton,
              isButtonDisabled && styles.connectButtonDisabled,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (!isButtonDisabled) {
                onConnect();
              }
            }}
            disabled={isButtonDisabled || isConnecting}
            activeOpacity={0.8}
          >
            {isConnecting ? (
              <Ionicons name="hourglass-outline" size={16} color="#A1A1AA" />
            ) : (
              <>
                {connectionStatus === 'connected' && (
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                )}
                {connectionStatus === 'pending' && (
                  <Ionicons name="time-outline" size={16} color="#F59E0B" />
                )}
                {connectionStatus === 'none' && (
                  <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
                )}
                <Text
                  style={[
                    styles.connectButtonText,
                    isButtonDisabled && styles.connectButtonTextDisabled,
                  ]}
                >
                  {getButtonText()}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52525B',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#3F3F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  connectButtonDisabled: {
    backgroundColor: '#27272A',
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  connectButtonTextDisabled: {
    color: '#A1A1AA',
  },
});

