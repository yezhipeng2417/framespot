import { Stack } from 'expo-router';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const router = useRouter();
  const { handleSignOut } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen name="explore" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
