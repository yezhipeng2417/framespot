import { StyleSheet, TouchableOpacity, Animated, Image, Dimensions, ScrollView, View, Linking } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PhotoMarker } from '@/components/PhotoMarker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { Photo } from '@/lib/supabase';

// 图片缓存目录
const CACHE_DIR = `${FileSystem.cacheDirectory}markers/`;

export default function MapScreen() {
  const router = useRouter();
  const { handleSignOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ScrollView ref for controlling the image carousel
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Animation values
  const exploreAnimation = useRef(new Animated.Value(0)).current;
  const profileAnimation = useRef(new Animated.Value(0)).current;
  const detailAnimation = useRef(new Animated.Value(0)).current;

  // 预加载图片
  const preloadImages = useCallback(async (photos: Photo[]) => {
    try {
      // 确保缓存目录存在
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

      // 预加载所有图片
      const preloadPromises = photos.map(async (photo) => {
        const imageUrl = photo.thumbnail_url || photo.image_urls[0];
        if (!imageUrl) return;

        const cacheKey = `marker-${photo.id}`;
        const cachePath = `${CACHE_DIR}${cacheKey}`;

        // 检查缓存是否存在
        const cacheInfo = await FileSystem.getInfoAsync(cachePath);
        if (cacheInfo.exists) return;

        // 下载并缓存图片
        try {
          await FileSystem.downloadAsync(imageUrl, cachePath);
        } catch (error) {
          console.error('Error preloading image:', error);
        }
      });

      await Promise.all(preloadPromises);
    } catch (error) {
      console.error('Error in preloadImages:', error);
    }
  }, []);

  // 获取照片数据
  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPhotos(data || []);
      
      // 预加载图片
      if (data) {
        preloadImages(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
        // Refresh photos when changes occur
        fetchPhotos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle photo selection
  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setDetailVisible(true);
    setCurrentImageIndex(0);
  };

  // Close detail view
  const closeDetail = () => {
    setDetailVisible(false);
  };
  
  // Animate menu items
  useEffect(() => {
    if (menuOpen) {
      Animated.sequence([
        Animated.timing(exploreAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(exploreAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuOpen]);

  // Animate detail view
  useEffect(() => {
    Animated.timing(detailAnimation, {
      toValue: detailVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !detailVisible) {
        setSelectedPhoto(null);
        setCurrentImageIndex(0);
      }
    });
  }, [detailVisible]);
  
  // Calculate animations
  const exploreTranslateY = exploreAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });
  
  const profileTranslateY = profileAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  const detailTranslateY = detailAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').height, 0],
  });
  
  // Handle image scroll events
  const handleScroll = (event: any) => {
    if (!selectedPhoto) return;
    
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    
    if (newIndex !== currentImageIndex) {
      setCurrentImageIndex(newIndex);
    }
  };
  
  // Method to navigate to a specific image
  const navigateToImage = (index: number) => {
    if (!selectedPhoto || !scrollViewRef.current) return;
    
    scrollViewRef.current.scrollTo({
      x: index * screenWidth,
      animated: true
    });
    setCurrentImageIndex(index);
  };

  // Preload images for smoother transitions
  useEffect(() => {
    if (selectedPhoto) {
      // Preload all images in the carousel
      selectedPhoto.image_urls.forEach(imageUrl => {
        Image.prefetch(imageUrl)
          .catch(err => console.log('Error preloading image:', err));
      });
    }
  }, [selectedPhoto]);

  // 处理个人资料按钮点击
  const handleProfilePress = () => {
    setMenuOpen(false);
    setProfileMenuVisible(true);
  };

  // 处理登出
  const onSignOutPress = async () => {
    try {
      setProfileMenuVisible(false);
      await handleSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 处理地图区域变化
  const handleRegionChange = useCallback((region: Region) => {
    // 可以在这里实现虚拟化加载
    // 只加载当前可见区域内的标记
  }, []);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChange={handleRegionChange}
      >
        {photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.location.latitude,
              longitude: photo.location.longitude,
            }}
            onPress={() => handlePhotoPress(photo)}
          >
            <PhotoMarker photo={photo} />
          </Marker>
        ))}
      </MapView>
      
      {/* Menu button (three dots) */}
      <TouchableOpacity 
        style={[styles.fabMenu]} 
        onPress={toggleMenu}
      >
        <IconSymbol name="ellipsis" size={22} color="#555" />
      </TouchableOpacity>
      
      {/* Explore button (appears when menu is opened) */}
      <Animated.View style={[
        styles.fabMenuItem,
        { 
          transform: [{ translateY: exploreTranslateY }],
          opacity: exploreAnimation,
          left: 20,
        }
      ]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            setMenuOpen(false);
            router.push('/explore');
          }}
        >
          <IconSymbol name="photo.on.rectangle" size={22} color="#555" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Profile button (appears when menu is opened) */}
      <Animated.View style={[
        styles.fabMenuItem,
        { 
          transform: [{ translateY: profileTranslateY }],
          opacity: profileAnimation,
          left: 20,
        }
      ]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleProfilePress}
        >
          <IconSymbol name="person.crop.circle" size={22} color="#555" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Profile Menu */}
      {profileMenuVisible && (
        <ThemedView style={styles.profileMenu}>
          <TouchableOpacity 
            style={styles.profileMenuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              router.push('/profile');
            }}
          >
            <IconSymbol name="person" size={20} color="#555" />
            <ThemedText style={styles.profileMenuText}>Profile</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.profileMenuItem, styles.signOutMenuItem]}
            onPress={onSignOutPress}
          >
            <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
            <ThemedText style={[styles.profileMenuText, styles.signOutText]}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* 点击空白处关闭个人资料菜单 */}
      {profileMenuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setProfileMenuVisible(false)}
        />
      )}
      
      {/* Upload button (always visible) */}
      <TouchableOpacity 
        style={[styles.fabBottomRight]} 
        onPress={() => router.push('/upload')}
      >
        <IconSymbol name="plus.circle.fill" size={28} color="#555" />
      </TouchableOpacity>
      
      {/* Photo Detail View */}
      {selectedPhoto && (
        <Animated.View 
          style={[
            styles.photoDetailContainer,
            { transform: [{ translateY: detailTranslateY }] }
          ]}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeDetail}
          >
            <IconSymbol name="xmark" size={20} color="#555" />
          </TouchableOpacity>
          
          {/* Images container with horizontal scrolling */}
          <ThemedView style={styles.imagesStack}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              style={styles.imageCarousel}
            >
              {selectedPhoto.image_urls.map((imageUrl, index) => (
                <View key={index} style={[styles.carouselImageContainer, { width: screenWidth }]}>
                  <Image 
                    source={{ uri: imageUrl }}
                    style={styles.mainImage}
                    resizeMode="cover"
                    onError={(e) => console.log('error:', e.nativeEvent.error)}
                    fadeDuration={300}
                  />
                </View>
              ))}
            </ScrollView>
            
            {/* Only show carousel dots if we have multiple images */}
            {selectedPhoto.image_urls.length > 1 && (
              <View style={styles.carouselDots}>
                {selectedPhoto.image_urls.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigateToImage(index)}
                  >
                    <View 
                      style={[
                        styles.dot, 
                        index === currentImageIndex && styles.activeDot
                      ]} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ThemedView>
          
          {/* Photo details */}
          <ScrollView style={styles.detailsContainer}>
            <ThemedText type="title">{selectedPhoto.title}</ThemedText>
            
            {/* Location info */}
            <ThemedView style={styles.locationRow}>
              <IconSymbol name="location.fill" size={16} color="#555" />
              <ThemedText style={styles.locationText}>{selectedPhoto.location.name}</ThemedText>
            </ThemedView>
            
            {/* User info */}
            <ThemedView style={styles.userRow}>
              <Image 
                source={{ uri: selectedPhoto.profiles?.avatar_url || 'https://via.placeholder.com/32' }} 
                style={styles.userAvatar}
              />
              <ThemedText style={styles.userName}>{selectedPhoto.profiles?.username || 'Unknown User'}</ThemedText>
            </ThemedView>
            
            {/* Description */}
            <ThemedText style={styles.description}>{selectedPhoto.description}</ThemedText>
            
            {/* Stats */}
            <ThemedView style={styles.statsRow}>
              <ThemedText style={styles.dateText}>
                {new Date(selectedPhoto.created_at).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
            
            {/* Directions button */}
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                const { latitude, longitude } = selectedPhoto.location;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                Linking.openURL(url);
              }}
            >
              <ThemedText style={styles.directionsText}>Get Directions</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  photoPreview: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fabMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 100,
  },
  fabMenuItem: {
    position: 'absolute',
    top: 50,
    zIndex: 99,
  },
  fabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  fabBottomRight: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  photoDetailContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imagesStack: {
    height: '40%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageCarousel: {
    width: '100%',
    height: '100%',
  },
  carouselImageContainer: {
    height: '100%',
  },
  mainImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    height: 70,
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    height: 70,
    width: 70,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    marginLeft: 8,
    fontWeight: '500',
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
  },
  dateText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#777',
  },
  directionsButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  directionsText: {
    fontWeight: '500',
  },
  noPhotosWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosText: {
    fontSize: 14,
    color: '#777',
  },
  carouselDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  navButtons: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  profileMenu: {
    position: 'absolute',
    top: 110,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  profileMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  signOutMenuItem: {
    marginTop: 4,
  },
  signOutText: {
    color: '#FF3B30',
  },
});
