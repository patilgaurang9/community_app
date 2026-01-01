import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export default function OnboardingStep2() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          job_title: jobTitle.trim() || null,
          company: company.trim() || null,
          industry: industry.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What do you do?</Text>
          <Text style={styles.subtitle}>
            Share your professional details (optional)
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Job Title"
            placeholder="Software Engineer"
            value={jobTitle}
            onChangeText={setJobTitle}
          />

          <Input
            label="Company / College"
            placeholder="Tech Inc."
            value={company}
            onChangeText={setCompany}
          />

          <Input
            label="Industry / Tags"
            placeholder="Technology, AI, Mobile"
            value={industry}
            onChangeText={setIndustry}
          />

          <Button
            title="Complete Profile"
            onPress={handleComplete}
            isLoading={isLoading}
            variant="primary"
            style={styles.button}
          />

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            disabled={isLoading}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  skipButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '500',
  },
});

