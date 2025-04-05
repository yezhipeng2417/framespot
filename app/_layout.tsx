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
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';
import Welcome from '@/components/Welcome';
import { SetupProfile } from '@/components/SetupProfile';
import { getUserProfile, type UserProfile } from '@/lib/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, isLoading, isAppleAuthAvailable } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // 检查用户资料
  useEffect(() => {
    async function checkProfile() {
      console.log('Checking profile for user:', user?.id);
      if (user) {
        try {
          const profileData = await getUserProfile(user.id);
          console.log('Profile data:', profileData);
          setProfile(profileData);
        } catch (error) {
          console.error('Error checking profile:', error);
        } finally {
          setCheckingProfile(false);
        }
      } else {
        console.log('No user found, skipping profile check');
        setCheckingProfile(false);
      }
    }
    checkProfile();
  }, [user]);

  console.log('Current state:', { 
    user, 
    isLoading, 
    isAppleAuthAvailable, 
    profile,
    checkingProfile 
  });

  if (isLoading || checkingProfile) {
    console.log('Loading or checking profile...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAppleAuthAvailable) {
    console.log('Apple Sign In not available');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Apple Sign In is not available on this device.</Text>
      </View>
    );
  }

  if (!user) {
    console.log('No user, showing Welcome screen');
    return <Welcome />;
  }

  // 如果用户已登录但未设置用户名，显示设置页面
  if (!profile?.username) {
    console.log('User has no username, showing SetupProfile');
    return <SetupProfile />;
  }

  console.log('User profile complete, showing main app');
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
