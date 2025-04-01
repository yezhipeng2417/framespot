import { Stack } from 'expo-router';
import React from 'react';
import { useRouter } from 'expo-router';
import { signOut } from '@/lib/auth';

export default function LayoutRoot() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          presentation: 'card',
        }}
        initialParams={{ onSignOut: handleSignOut }}
      />
      <Stack.Screen name="explore" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
