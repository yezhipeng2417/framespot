/*
 * @Description: 
 * @Date: 2025-04-01 12:19:21
 * @LastEditTime: 2025-04-01 18:14:02
 * @FilePath: /framespot/app/_layout.tsx
 * @LastEditors: Xinyi Yan
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';
import Welcome from '@/components/Welcome';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, isLoading, isAppleAuthAvailable } = useAuth();
  console.log('Auth State:', { user, isLoading, isAppleAuthAvailable });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAppleAuthAvailable) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Apple Sign In is not available on this device.</Text>
      </View>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppContent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
