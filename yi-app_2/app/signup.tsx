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
import ScreenWrapper from '../components/ScreenWrapper';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {            
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      // We pass metadata so the Trigger can use it immediately for the name
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            // City is passed here but the trigger might not use it, 
            // so we explicitly update it below.
            city: city.trim(),
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // 2. UPDATE the profile (Safe method)
      // The trigger has already created the row. We just add the missing details.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(), // Ensure name is exact
          location: city.trim(),      // Add the city (Trigger usually misses this)
        })
        .eq('id', authData.user.id);  // Find the row the trigger created

      if (profileError) {
        console.error('Profile update error:', profileError);
        // We warn but don't block. The account exists, user can fix profile later.
        Alert.alert('Notice', 'Account created, but could not save City. Please update profile later.');
      }

      // 3. Handle Redirect
      if (authData.session) {
        Alert.alert('Success', 'Account created successfully!');
        // AuthContext will detect session and redirect to Home
      } else {
        Alert.alert(
          'Verify Your Email',
          'Please check your email and click the confirmation link to activate your account.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      
      let errorMessage = 'Failed to create account';
      if (err.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and get started</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setErrors({ ...errors, fullName: '' });
            }}
            error={errors.fullName}
          />

          <Input
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            secureTextEntry={true}
          />

          <Input
            label="City"
            placeholder="New York"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              setErrors({ ...errors, city: '' });
            }}
            error={errors.city}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            isLoading={isLoading}
            variant="primary"
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginLink}
            disabled={isLoading === true}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
            </Text>
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
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  loginTextBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

