import { Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Tabs>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => <span>📊</span>,
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: 'Transactions',
              tabBarIcon: ({ color }) => <span>💳</span>,
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color }) => <span>📈</span>,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <span>⚙️</span>,
            }}
          />
        </Tabs>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
