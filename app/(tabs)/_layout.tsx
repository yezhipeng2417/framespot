import { Stack } from 'expo-router';
import React from 'react';

export default function LayoutRoot() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
