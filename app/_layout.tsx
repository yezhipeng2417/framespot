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
import { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Text, Animated } from 'react-native';
import Welcome from '@/components/Welcome';
import { SetupProfile } from '@/components/SetupProfile';
import { getUserProfile, type UserProfile } from '@/lib/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type AppState = 'loading' | 'checking' | 'welcome' | 'setup' | 'main';

function AppContent() {
  const { user, isLoading, isAppleAuthAvailable } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 检查用户资料
  useEffect(() => {
    let mounted = true;

    async function checkProfile() {
      if (!user) {
        if (mounted) {
          setAppState('welcome');
        }
        return;
      }

      setAppState('checking');

      try {
        const profileData = await getUserProfile(user.id);
        if (mounted) {
          setProfile(profileData);
          setAppState(profileData?.username ? 'main' : 'setup');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        if (mounted) {
          setAppState('setup');
        }
      }
    }

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  // 淡入动画
  useEffect(() => {
    if (appState !== 'loading') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [appState]);

  // 等待所有必要的状态都准备好
  if (isLoading || appState === 'loading') {
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

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <Welcome />;
      case 'setup':
        return <SetupProfile />;
      case 'main':
        return (
          <Stack>
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'none'
              }} 
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        );
      case 'checking':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {renderContent()}
    </Animated.View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppContent />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}
