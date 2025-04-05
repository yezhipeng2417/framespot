import { Stack } from 'expo-router';
import React from 'react';
import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const router = useRouter();
  const { handleSignOut } = useAuth();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen name="explore" options={{ presentation: 'modal' }} />
      <Tabs.Screen name="upload" options={{ presentation: 'modal' }} />
      <Tabs.Screen name="profile" options={{ presentation: 'modal' }} />
    </Tabs>
  );
}
