import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
const AUTH_KEY = 'auth_user';

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
  username: string | null;
  full_name: string | null;
  bio: string | null;
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
  console.log('Fetching profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 表示没有找到记录，这是正常的情况
      if (error.code === 'PGRST116') {
        console.log('No profile found for user:', userId);
        return null;
      }
      // 其他错误才需要报错
      console.error('Error fetching user profile:', error.message);
      console.error('Error details:', error);
      return null;
    }

    console.log('Profile data retrieved:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return null;
  }
}

// 更新用户配置文件
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  console.log('Updating profile:', profile);

  try {
    // 先获取当前会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'exists' : 'null');
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Failed to get session: ' + sessionError.message);
    }

    if (!session) {
      console.error('No active session found');
      throw new Error('No active session');
    }

    // 先尝试更新
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();

    // 如果记录不存在，则创建新记录
    if (error && error.code === 'PGRST116') {
      console.log('Profile not found, creating new profile');
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          ...profile,
          email: session.user.email, // 使用当前用户的 email
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw new Error('Failed to create profile: ' + insertError.message);
      }

      console.log('New profile created:', insertData);
      return insertData;
    }

    // 处理其他错误
    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile: ' + error.message);
    }

    console.log('Profile updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Unexpected error in updateUserProfile:', error);
    throw error;
  }
}

// 上传图片到 Storage
export async function uploadImage(
  filePath: string,
  userId: string,
  bucket: string = 'photos'
): Promise<string | null> {
  try {
    console.log('Starting image upload:', { filePath, userId, bucket });
    
    // 获取文件扩展名
    const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    console.log('Preparing to fetch file from:', filePath);
    // 获取文件内容
    const response = await fetch(filePath);
    console.log('File fetch response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const blob = await response.blob();
    console.log('Blob created:', {
      size: blob.size,
      type: blob.type
    });

    console.log('Uploading file to Supabase:', {
      bucket,
      fileName,
      contentType: `image/${ext}`
    });
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    console.log('Upload successful:', data);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Generated public URL:', publicUrl);
    
    // 验证上传的文件是否可访问
    try {
      const checkResponse = await fetch(publicUrl);
      console.log('URL check response:', {
        status: checkResponse.status,
        statusText: checkResponse.statusText,
        contentLength: checkResponse.headers.get('content-length'),
        contentType: checkResponse.headers.get('content-type')
      });
    } catch (checkError) {
      console.error('Error checking uploaded file:', checkError);
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
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