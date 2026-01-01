import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

export default function HostEvent() {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:events@community.com');
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host an Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={64} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>Host Your Event</Text>
          <Text style={styles.heroSubtitle}>
            Share your event with our community
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionDescription}>
            Interested in hosting an event? Get in touch with us and we'll help you get started!
          </Text>

          {/* Phone */}
          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color="#10B981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1 (234) 567-890</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717A" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#3B82F6" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>events@community.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717A" />
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          
          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Event Promotion</Text>
              <Text style={styles.featureDescription}>
                We'll promote your event to our entire community through our app and social media channels.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>RSVP Management</Text>
              <Text style={styles.featureDescription}>
                Track attendees, send reminders, and manage your event RSVPs all in one place.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Featured Listing</Text>
              <Text style={styles.featureDescription}>
                Get your event featured on our homepage carousel for maximum visibility.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Community Support</Text>
              <Text style={styles.featureDescription}>
                Connect with other event hosts and get tips from our community team.
              </Text>
            </View>
          </View>
        </View>

        {/* Process Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Contact Us</Text>
              <Text style={styles.stepDescription}>
                Reach out via phone or email with your event details
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review & Approval</Text>
              <Text style={styles.stepDescription}>
                Our team reviews your event and gets back to you within 24-48 hours
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Event Goes Live</Text>
              <Text style={styles.stepDescription}>
                Once approved, your event is published and visible to all community members
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>
            Ready to host your event? Get in touch with us today!
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#000000" />
            <Text style={styles.ctaButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#27272A',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#A1A1AA',
    fontSize: 18,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionDescription: {
    color: '#D4D4D8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    color: '#71717A',
    fontSize: 13,
    marginBottom: 4,
  },
  contactValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 24,
    backgroundColor: '#18181B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});

