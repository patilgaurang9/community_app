import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function Updates() {
  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Buzz</Text>
          <Text style={styles.subtitle}>Stay updated with community celebrations</Text>
        </View>

        {/* Today's Birthdays Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>🎉 Today's Birthdays</Text>
          </View>
          
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎂</Text>
            <Text style={styles.emptyText}>No birthdays today</Text>
          </View>
        </View>

        {/* Work Anniversaries Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>💼 Work Anniversaries</Text>
          </View>
          
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎊</Text>
            <Text style={styles.emptyText}>No work anniversaries today</Text>
          </View>
        </View>

        {/* Upcoming This Week */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>📅 Upcoming This Week</Text>
          </View>
          
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>No upcoming celebrations</Text>
          </View>
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
    paddingBottom: 40,
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
  },
});

