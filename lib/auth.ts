import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AUTH_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

// 检查 Apple ID 凭证状态
export async function checkAppleCredentialState(userId: string): Promise<boolean> {
  try {
    // Web 环境下直接返回 false
    if (Platform.OS === 'web') {
      console.log('Apple Sign In not supported on web');
      return false;
    }

    const credentialState = await AppleAuthentication.getCredentialStateAsync(userId);
    console.log('Apple credential state:', credentialState);
    
    return credentialState === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED;
  } catch (error) {
    console.log('Error checking Apple credential:', error);
    return false;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    console.log('Retrieved user data:', data);
    
    if (!data) {
      console.log('No user data found');
      return null;
    }

    try {
      const user = JSON.parse(data);
      if (!user || !user.id) {
        console.log('Invalid user data found, removing...');
        await AsyncStorage.removeItem(AUTH_KEY);
        return null;
      }

      // 检查 Apple ID 凭证状态
      const isAuthorized = await checkAppleCredentialState(user.id);
      if (!isAuthorized) {
        console.log('Apple ID not authorized, removing user data...');
        await AsyncStorage.removeItem(AUTH_KEY);
        return null;
      }

      return user;
    } catch (parseError) {
      console.error('Error parsing user data:', parseError);
      await AsyncStorage.removeItem(AUTH_KEY);
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signInWithApple(): Promise<AuthUser> {
  try {
    // Web 环境下不支持 Apple Sign In
    if (Platform.OS === 'web') {
      throw new Error('Apple Sign In is not supported on web');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const user: AuthUser = {
      id: credential.user,
      email: credential.email,
      fullName: credential.fullName 
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
        : null,
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
    console.log('User signed in:', user);
    return user;
  } catch (e: any) {
    if (e.code === 'ERR_CANCELED') {
      throw new Error('User cancelled Apple Sign in');
    }
    throw e;
  }
}

export async function signOut(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// 初始化时清除存储的用户数据
export async function initAuth(): Promise<void> {
  try {
    await AsyncStorage.clear(); // 清除所有存储的数据
    console.log('Auth initialized, all data cleared');
  } catch (error) {
    console.error('Error initializing auth:', error);
    throw error;
  }
}

export async function isAvailable(): Promise<boolean> {
  // Web 环境下直接返回 false
  if (Platform.OS === 'web') {
    console.log('Apple Sign In not available on web');
    return false;
  }

  const available = await AppleAuthentication.isAvailableAsync();
  console.log('Apple Sign In available:', available);
  return available;
} 