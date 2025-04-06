import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, FlatList, Dimensions, TouchableOpacity, RefreshControl, ActivityIndicator, View, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserPhotos, type UserProfile, type Photo } from '@/lib/supabase';
import { SetupProfile } from '@/components/SetupProfile';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns - 4;

// 默认头像 URL - 使用 Gravatar 的默认头像
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, handleSignOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const scrollY = new Animated.Value(0);

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

  const handleSignOutPress = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await handleSignOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // 显示加载状态
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
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
      <StatusBar style="light" />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Animated.View style={[
            styles.avatarContainer,
            {
              transform: [
                { scale: avatarScale },
                { translateY: avatarTranslateY }
              ]
            }
          ]}>
            <Image 
              source={{ 
                uri: profile?.avatar_url || DEFAULT_AVATAR,
                cache: 'default',
              }} 
              style={styles.avatar}
              onError={(error) => {
                console.error('Avatar load error:', {
                  error: error.nativeEvent,
                  attemptedUrl: profile?.avatar_url || DEFAULT_AVATAR
                });
                setAvatarError(true);
                
                if (profile?.avatar_url && profile.avatar_url !== DEFAULT_AVATAR) {
                  setProfile({
                    ...profile,
                    avatar_url: DEFAULT_AVATAR
                  });
                }
              }}
              onLoad={() => {
                setAvatarError(false);
              }}
            />
          </Animated.View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>{photos.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Photos</ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.profileInfo}>
          <ThemedText type="title" style={styles.name}>{profile?.full_name || profile?.username}</ThemedText>
          <ThemedText style={styles.username}>@{profile?.username}</ThemedText>
          {profile?.bio && (
            <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/profile/edit')}
            >
              <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOutPress}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        
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
          scrollEnabled={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <IconSymbol name="photo" size={48} color="#999" />
              <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
            </View>
          )}
        />
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    marginTop: 200,
  },
  profileInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  username: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signOutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosList: {
    padding: 2,
  },
  photoTile: {
    width: tileSize,
    height: tileSize,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
}); 