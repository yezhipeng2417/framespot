import { StyleSheet, TouchableOpacity, Animated, Image, Dimensions, ScrollView, View, Linking, Alert } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PhotoMarker } from '@/components/PhotoMarker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { Photo } from '@/lib/supabase';
import { PhotoDetailView } from '@/components/PhotoDetailView';
import { PhotoMetadata } from '@/components/PhotoMetadata';
import { MenuButtons } from '@/components/MenuButtons';
import { ReturnToLocationButton } from '@/components/ReturnToLocationButton';

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
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ScrollView ref for controlling the image carousel
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Animation values
  const exploreAnimation = useRef(new Animated.Value(0)).current;
  const profileAnimation = useRef(new Animated.Value(0)).current;
  const detailAnimation = useRef(new Animated.Value(0)).current;
  const returnButtonAnimation = useRef(new Animated.Value(0)).current;

  const mapRef = useRef<MapView>(null);

  // 检查用户是否偏离当前位置
  const checkLocationDeviation = useCallback((region: Region) => {
    if (!userLocation) return;

    const distance = calculateDistance(
      region.latitude,
      region.longitude,
      userLocation.coords.latitude,
      userLocation.coords.longitude
    );

    // 如果距离超过 10 公里，显示返回按钮
    if (distance > 10) {
      setShowReturnButton(true);
      Animated.timing(returnButtonAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setShowReturnButton(false);
      Animated.timing(returnButtonAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [userLocation]);

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
  const fetchPhotos = async (region?: Region, isInitialLoad: boolean = false) => {
    if (isFetching && !isInitialLoad) return;
    
    try {
      setIsFetching(true);
      setIsLoading(true);
      
      // 构建查询条件
      let query = supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // 如果提供了区域信息，添加地理范围过滤
      if (region) {
        const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
        const latMin = latitude - latitudeDelta / 2;
        const latMax = latitude + latitudeDelta / 2;
        const lonMin = longitude - longitudeDelta / 2;
        const lonMax = longitude + longitudeDelta / 2;

        query = query
          .gte('location->latitude', latMin)
          .lte('location->latitude', latMax)
          .gte('location->longitude', lonMin)
          .lte('location->longitude', lonMax);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      // 使用函数式更新确保状态更新的原子性
      setPhotos(prevPhotos => {
        const newPhotos = data || [];
        // 如果新数据与现有数据相同，则不更新
        if (JSON.stringify(prevPhotos) === JSON.stringify(newPhotos)) {
          return prevPhotos;
        }
        return newPhotos;
      });
      
      // 预加载图片
      if (data) {
        preloadImages(data).catch(error => {
          console.error('Error preloading images:', error);
        });
      }
    } catch (error) {
      console.error('Error in fetchPhotos:', error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // 处理地图区域变化
  const handleRegionChange = useCallback((region: Region) => {
    // 清除之前的定时器
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    setCurrentRegion(region);
    checkLocationDeviation(region);
    
    // 使用防抖，延迟执行获取照片
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPhotos(region);
    }, 1000); // 增加延迟时间到 1 秒
  }, [checkLocationDeviation]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // 组件加载时检查位置权限
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // 初始加载照片
  useEffect(() => {
    if (currentRegion && !isFetching) {
      fetchPhotos(currentRegion);
    }
  }, [currentRegion]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 清理所有状态
      setPhotos([]);
      setCurrentRegion(null);
      setIsFetching(false);
      setIsLoading(false);
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
    
    // Zoom in to the marker location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: photo.location.latitude,
        longitude: photo.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500); // 500ms 动画时间
    }
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

  // 计算两点之间的距离（公里）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 地球半径（公里）
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  // 返回到用户位置
  const returnToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01, // 更精确的缩放级别
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  // 请求位置权限
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
        
        // 移动到用户位置
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }
      } else {
        Alert.alert(
          'Location Permission Denied',
          'We need your location permission to show nearby content. You can change this in your settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  // 检查位置权限
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
        
        // 设置当前区域并加载附近的图片
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCurrentRegion(region);
        
        // 立即加载照片，不等待防抖
        fetchPhotos(region, true);
        
        // 移动到用户位置
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 500);
        }
      } else {
        requestLocationPermission();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.coords.latitude ?? 37.78825,
          longitude: userLocation?.coords.longitude ?? -122.4324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onRegionChange={handleRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={true}
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
      
      <MenuButtons
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        onProfilePress={handleProfilePress}
      />
      
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
        <PhotoDetailView
          selectedPhoto={selectedPhoto}
          detailVisible={detailVisible}
          onClose={closeDetail}
        />
      )}

      <ReturnToLocationButton
        showReturnButton={showReturnButton}
        returnButtonAnimation={returnButtonAnimation}
        onPress={returnToUserLocation}
      />
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
  returnButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  returnButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metadataContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 16,
  },
  metadataTitle: {
    marginBottom: 12,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  metadataText: {
    fontSize: 14,
  },
});
