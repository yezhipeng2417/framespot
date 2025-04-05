import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, FlatList, Dimensions, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserPhotos, type UserProfile, type Photo } from '@/lib/supabase';
import { SetupProfile } from '@/components/SetupProfile';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns - 4;

// 默认头像 URL - 使用 Gravatar 的默认头像
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const [profileData, userPhotos] = await Promise.all([
        getUserProfile(user.id),
        getUserPhotos(user.id)
      ]);

      setProfile(profileData);
      setPhotos(userPhotos);
      setAvatarError(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  // 添加对 profile 为 null 的检查
  if (!profile) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ThemedText>Failed to load profile</ThemedText>
        <TouchableOpacity 
          style={[styles.editButton, { marginTop: 16 }]}
          onPress={loadProfileData}
        >
          <ThemedText style={styles.editButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image 
          source={{ 
            uri: profile?.avatar_url || DEFAULT_AVATAR,
            cache: 'force-cache',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }} 
          style={styles.avatar}
          onError={(error) => {
            console.error('Avatar load error:', {
              error: error.nativeEvent,
              attemptedUrl: profile?.avatar_url || DEFAULT_AVATAR
            });
            setAvatarError(true);
            
            // 如果是自定义头像加载失败，尝试使用默认头像
            if (profile?.avatar_url && profile.avatar_url !== DEFAULT_AVATAR) {
              console.log('Custom avatar failed to load, falling back to default avatar');
              setProfile({
                ...profile,
                avatar_url: DEFAULT_AVATAR
              });
            } else if (profile?.avatar_url === DEFAULT_AVATAR) {
              console.error('Default avatar also failed to load');
            }
          }}
          onLoad={() => {
            console.log('Avatar loaded successfully:', {
              url: profile?.avatar_url || DEFAULT_AVATAR,
              isDefaultAvatar: profile?.avatar_url === DEFAULT_AVATAR
            });
            setAvatarError(false);
          }}
          fadeDuration={300}
        />
        
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="title">{photos.length}</ThemedText>
            <ThemedText>Photos</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.bioContainer}>
          <ThemedText type="defaultSemiBold">{profile?.full_name || profile?.username}</ThemedText>
          <ThemedText>@{profile?.username}</ThemedText>
          {profile?.bio && (
            <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
          )}
        </ThemedView>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/profile/edit')}
        >
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.photoTile}
            onPress={() => {
              // Handle photo press
            }}
          >
            <Image 
              source={{ uri: item.image_urls[0] }} 
              style={styles.photoImage}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.photosList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="photo" size={48} color="#999" />
            <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bio: {
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  editButtonText: {
    fontWeight: '500',
  },
  photosList: {
    padding: 2,
    flexGrow: 1,
  },
  photoTile: {
    width: tileSize,
    height: tileSize,
    margin: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 