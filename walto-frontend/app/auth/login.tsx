import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { login } from '@/services/auth';
import { useStore } from '@/store/useStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setLoading, isLoading } = useStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please enter phone and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(phone, password);
      setUser({ ...response.user, token: response.token });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Login
            </Text>

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button mode="contained" onPress={handleLogin} loading={isLoading} style={styles.button}>
              Login
            </Button>

            <Button mode="text" onPress={() => router.push('/auth/register')}>
              Don't have an account? Register
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
  },
});
