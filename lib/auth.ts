import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';

const AUTH_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl?: string | null;
}

// 检查 Apple ID 凭证状态
export async function checkAppleCredentialState(userId: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      console.log('Apple Sign In not supported on web');
      return false;
    }

    const credentialState = await AppleAuthentication.getCredentialStateAsync(userId);
    console.log('Apple credential state:', credentialState);
    
    // 2 表示 AUTHORIZED 状态
    return credentialState === 2;
  } catch (error) {
    console.log('Error checking Apple credential:', error);
    return false;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // 获取 Supabase 会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }

    if (!session) {
      console.log('No active session');
      return null;
    }

    // 从 session 中构建用户信息
    return {
      id: session.user.id,
      email: session.user.email || null,
      fullName: session.user.user_metadata?.full_name || null,
      avatarUrl: session.user.user_metadata?.avatar_url || null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signInWithApple(): Promise<AuthUser> {
  try {
    if (Platform.OS === 'web') {
      throw new Error('Apple Sign In is not supported on web');
    }

    // 生成随机 nonce
    const rawNonce = Math.random().toString(36).substring(2, 10);
    
    // 计算 nonce 的 SHA256 哈希值
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    // 获取 Apple 认证凭证
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    // 使用 Apple ID Token 登录 Supabase
    const { data: { user, session }, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
      nonce: rawNonce, // 使用原始 nonce
    });

    if (error || !user) {
      console.error('Supabase auth error:', error);
      throw error || new Error('Failed to sign in with Supabase');
    }

    if (!session) {
      console.error('No session returned from Supabase');
      throw new Error('Authentication failed: No session returned');
    }

    // 保存会话状态
    console.log('Saving auth session...');
    try {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      console.log('Auth session saved successfully');

      // 等待一段时间确保会话完全保存
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 验证会话
      const { data: { session: verifySession }, error: verifyError } = await supabase.auth.getSession();
      if (verifyError) {
        console.error('Failed to verify session:', verifyError);
        throw new Error('Session verification failed: ' + verifyError.message);
      }
      if (!verifySession) {
        console.error('No session found during verification');
        throw new Error('Session verification failed: No session found');
      }
      console.log('Session verified successfully');
    } catch (error: any) {
      console.error('Error during session handling:', error);
      throw new Error('Failed to handle session: ' + error.message);
    }

    // 等待会话完全建立
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新用户元数据
    if (credential.fullName) {
      const fullName = `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim();
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            email: credential.email || user.email,
          }
        });

        if (!updateError) {
          break;
        }

        console.log(`Retry ${retryCount + 1} updating user metadata...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCount++;
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || null,
      fullName: user.user_metadata?.full_name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    console.log('User signed in:', authUser);
    return authUser;
  } catch (e: any) {
    console.error('Apple Sign In error:', e);
    if (e.code === 'ERR_CANCELED') {
      throw new Error('User cancelled Apple Sign in');
    }
    throw e;
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
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
    await AsyncStorage.clear();
    console.log('Auth initialized, all data cleared');
  } catch (error) {
    console.error('Error initializing auth:', error);
    throw error;
  }
}

export async function isAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  return await AppleAuthentication.isAvailableAsync();
}

// 获取用户资料
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
} 