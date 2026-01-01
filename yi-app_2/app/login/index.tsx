import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleLogin = async () => {
    // Validate
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Successful login
      console.log('Login successful:', data.user?.email);
      // AuthContext will handle redirect
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Supabase errors
      let errorMessage = 'Invalid credentials';
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before logging in';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
      setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            secureTextEntry={true}
            error={errors.password}
          />

          <Button
            title="Log In"
            onPress={handleLogin}
            isLoading={isLoading}
            variant="primary"
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => router.push('/signup')}
            style={styles.signupLink}
            disabled={isLoading === true}
          >
            <Text style={styles.signupText}>
              New here? <Text style={styles.signupTextBold}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  signupText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  signupTextBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
