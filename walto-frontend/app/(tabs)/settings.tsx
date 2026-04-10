import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { logout } from '@/services/auth';
import { useStore } from '@/store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, setUser } = useStore();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            setUser(null);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Account</Text>
          <Text variant="bodyLarge" style={styles.info}>
            {user?.phone || 'Not logged in'}
          </Text>
          {user?.email && (
            <Text variant="bodyMedium" style={styles.info}>
              {user.email}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">App Information</Text>
          <Text variant="bodyMedium" style={styles.info}>Version: 1.0.0</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleLogout} style={styles.button} buttonColor="#d32f2f">
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  info: {
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
});
