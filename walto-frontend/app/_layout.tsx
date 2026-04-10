import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getStoredUser, isAuthenticated } from '@/services/auth';
import { useStore } from '@/store/useStore';

export default function RootLayout() {
  const router = useRouter();
  const { setUser } = useStore();

  useEffect(() => {
    (async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.replace('/auth/login');
        return;
      }
      const user = await getStoredUser();
      if (user) setUser({ ...user, token: await (await import('@react-native-async-storage/async-storage')).default.getItem('authToken') ?? '' });
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
