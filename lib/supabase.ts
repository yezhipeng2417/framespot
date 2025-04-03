import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// 用户配置文件类型
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// 照片类型
export interface Photo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

// 获取用户配置文件
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
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
}

// 更新用户配置文件
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

// 上传图片到 Storage
export async function uploadImage(
  filePath: string,
  userId: string,
  bucket: string = 'photos'
): Promise<string | null> {
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, filePath);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

// 创建新的照片记录
export async function createPhoto(photo: Omit<Photo, 'id' | 'created_at' | 'updated_at'>): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .insert(photo)
    .select()
    .single();

  if (error) {
    console.error('Error creating photo:', error);
    return null;
  }

  return data;
}

// 获取用户的所有照片
export async function getUserPhotos(userId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user photos:', error);
    return [];
  }

  return data;
}

// 获取附近的照片
export async function getNearbyPhotos(
  latitude: number,
  longitude: number,
  radiusInKm: number = 10
): Promise<Photo[]> {
  // 使用 PostGIS 的 ST_DWithin 函数查询附近的照片
  const { data, error } = await supabase
    .rpc('get_photos_within_radius', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusInKm
    });

  if (error) {
    console.error('Error fetching nearby photos:', error);
    return [];
  }

  return data;
} 