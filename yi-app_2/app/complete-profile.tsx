import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// Strict TypeScript interface for profile data
interface ProfileUpdateData {
  bio: string;
  phone_number: string;
  job_title: string;
  company: string;
  industry: string;
  linkedin_url: string;
  batch_year: string;
  dob: string;
  job_start_date: string;
  tags: string[];
  is_profile_complete: boolean;
}

export default function CompleteProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Protect this route - redirect to login if no user
  useEffect(() => {
    if (!user) {
      console.log('No user found in complete-profile, redirecting to login');
      router.replace('/login');
    }
  }, [user]);

  // Form state
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [dob, setDob] = useState('');
  const [jobStartDate, setJobStartDate] = useState('');
  
  // Tags state (3 separate states)
  const [tag1, setTag1] = useState('');
  const [tag2, setTag2] = useState('');
  const [tag3, setTag3] = useState('');

  // Validation helper with strict rules
  const validateInputs = (): string | null => {
    // Bio validation
    if (!bio.trim()) {
      return 'Bio is required';
    }
    if (bio.trim().length < 10) {
      return 'Bio must be at least 10 characters';
    }

    // Phone Number validation (10-15 digits)
    if (!phoneNumber.trim()) {
      return 'Phone Number is required';
    }
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return 'Phone Number must be 10-15 digits';
    }

    // Job Title validation
    if (!jobTitle.trim()) {
      return 'Job Title is required';
    }

    // Company validation
    if (!company.trim()) {
      return 'Company is required';
    }

    // Industry validation
    if (!industry.trim()) {
      return 'Industry is required';
    }

    // LinkedIn URL validation (must start with http/https)
    if (!linkedinUrl.trim()) {
      return 'LinkedIn URL is required';
    }
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(linkedinUrl.trim())) {
      return 'LinkedIn URL must start with http:// or https://';
    }

    // Batch Year validation (4 digits)
    if (!batchYear.trim()) {
      return 'Batch Year is required';
    }
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(batchYear.trim())) {
      return 'Batch Year must be exactly 4 digits (e.g., 2024)';
    }
    const year = parseInt(batchYear.trim());
    if (year < 1950 || year > 2050) {
      return 'Batch Year must be between 1950 and 2050';
    }

    // DOB validation (strict YYYY-MM-DD)
    if (!dob.trim()) {
      return 'Date of Birth is required';
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob.trim())) {
      return 'Date of Birth must be in YYYY-MM-DD format';
    }
    const dobDate = new Date(dob.trim());
    if (isNaN(dobDate.getTime())) {
      return 'Date of Birth must be a valid date';
    }

    // Job Start Date validation (strict YYYY-MM-DD)
    if (!jobStartDate.trim()) {
      return 'Job Start Date is required';
    }
    if (!dateRegex.test(jobStartDate.trim())) {
      return 'Job Start Date must be in YYYY-MM-DD format';
    }
    const jobDate = new Date(jobStartDate.trim());
    if (isNaN(jobDate.getTime())) {
      return 'Job Start Date must be a valid date';
    }

    // Tag 1 validation (mandatory)
    if (!tag1.trim()) {
      return 'At least Tag 1 is required';
    }

    return null; // All validations passed
  };

  const handleCompleteSetup = async () => {
    // Validate inputs first
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No user found. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      // Construct tags array by filtering out empty strings
      const tagsArray: string[] = [tag1, tag2, tag3]
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Prepare profile update data
      const profileData: ProfileUpdateData = {
        bio: bio.trim(),
        phone_number: phoneNumber.trim(),
        job_title: jobTitle.trim(),
        company: company.trim(),
        industry: industry.trim(),
        linkedin_url: linkedinUrl.trim(),
        batch_year: batchYear.trim(),
        dob: dob.trim(),
        job_start_date: jobStartDate.trim(),
        tags: tagsArray,
        is_profile_complete: true,
      };

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Success! Show success animation
      setIsSuccess(true);
      
      // Wait exactly 2 seconds, then navigate to home
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 2000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen Component
  if (isSuccess) {
    return (
      <ScreenWrapper>
        <View style={styles.successContainer}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Profile Setup Complete</Text>
          <Text style={styles.successSubtitle}>Redirecting you to home...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Main Form Screen
  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            All fields are mandatory. Please provide accurate information.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Personal & Professional Details Section */}
          <Text style={styles.sectionHeader}>Personal & Professional Details</Text>

          <Input
            label={<Text style={styles.label}>Bio <Text style={styles.required}>*</Text></Text>}
            placeholder="Tell us about yourself (min. 10 characters)..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={styles.bioInput}
            textAlignVertical="top"
            autoCapitalize="sentences"
          />

          <Input
            label={<Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>}
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <Input
            label={<Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>}
            placeholder="YYYY-MM-DD (e.g., 1990-05-15)"
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Input
            label={<Text style={styles.label}>Job Title <Text style={styles.required}>*</Text></Text>}
            placeholder="e.g. Software Engineer"
            value={jobTitle}
            onChangeText={setJobTitle}
            autoCapitalize="words"
          />

          <Input
            label={<Text style={styles.label}>Company <Text style={styles.required}>*</Text></Text>}
            placeholder="e.g. Acme Inc."
            value={company}
            onChangeText={setCompany}
            autoCapitalize="words"
          />

          <Input
            label={<Text style={styles.label}>Job Start Date <Text style={styles.required}>*</Text></Text>}
            placeholder="YYYY-MM-DD (e.g., 2023-01-15)"
            value={jobStartDate}
            onChangeText={setJobStartDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Input
            label={<Text style={styles.label}>Industry <Text style={styles.required}>*</Text></Text>}
            placeholder="e.g. Technology"
            value={industry}
            onChangeText={setIndustry}
            autoCapitalize="words"
          />

          <Input
            label={<Text style={styles.label}>LinkedIn URL <Text style={styles.required}>*</Text></Text>}
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Input
            label={<Text style={styles.label}>Batch Year <Text style={styles.required}>*</Text></Text>}
            placeholder="e.g. 2024"
            value={batchYear}
            onChangeText={setBatchYear}
            keyboardType="number-pad"
            maxLength={4}
          />

          {/* Interests / Tags Section */}
          <Text style={[styles.sectionHeader, styles.tagsHeader]}>
            Interests / Tags (Enter 3)
          </Text>

          <Input
            label={<Text style={styles.label}>Tag 1 <Text style={styles.required}>*</Text></Text>}
            placeholder="e.g. React Native"
            value={tag1}
            onChangeText={setTag1}
            autoCapitalize="words"
          />

          <Input
            label="Tag 2"
            placeholder="e.g. Machine Learning"
            value={tag2}
            onChangeText={setTag2}
            autoCapitalize="words"
          />

          <Input
            label="Tag 3"
            placeholder="e.g. Cloud Computing"
            value={tag3}
            onChangeText={setTag3}
            autoCapitalize="words"
          />

          <Text style={styles.requiredNote}>
            <Text style={styles.required}>*</Text> indicates mandatory fields
          </Text>

          <Button
            title="Complete Setup"
            onPress={handleCompleteSetup}
            isLoading={isLoading}
            style={styles.submitButton}
          />
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
    paddingVertical: 24,
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
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  tagsHeader: {
    marginTop: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 16,
  },
  requiredNote: {
    color: '#71717A',
    fontSize: 14,
    marginBottom: 24,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 64,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
  },
});
