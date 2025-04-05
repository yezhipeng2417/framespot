import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Photo } from '@/types/types';
import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}markers/`;

export function PhotoMarker({ photo }: { photo: Photo }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const startTime = Date.now();
      console.log(`[PhotoMarker] Starting to load marker for photo: ${photo.id}`);

      try {
        // 确保缓存目录存在
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!dirInfo.exists) {
          console.log(`[PhotoMarker] Creating cache directory`);
          await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        }

        // 优先使用 thumbnail_url
        const imageUrl = photo.thumbnail_url;
        if (!imageUrl) {
          console.log(`[PhotoMarker] No thumbnail URL found for photo: ${photo.id}`);
          return;
        }

        const cacheKey = `marker-${photo.id}.jpg`;
        const cachePath = `${CACHE_DIR}${cacheKey}`;
        console.log(`[PhotoMarker] Cache path: ${cachePath}`);

        // 检查缓存是否存在
        const cacheCheckStart = Date.now();
        const cacheInfo = await FileSystem.getInfoAsync(cachePath);
        console.log(`[PhotoMarker] Cache check took: ${Date.now() - cacheCheckStart}ms`);
        
        if (cacheInfo.exists) {
          console.log(`[PhotoMarker] Using cached image for photo: ${photo.id}`);
          setImageUri(cachePath);
          setIsLoading(false);
          return;
        }

        // 如果缓存不存在，下载并缓存图片
        console.log(`[PhotoMarker] Downloading and caching image for photo: ${photo.id}`);
        const downloadStart = Date.now();
        const { uri } = await FileSystem.downloadAsync(imageUrl, cachePath);
        console.log(`[PhotoMarker] Download took: ${Date.now() - downloadStart}ms`);
        
        setImageUri(uri);
      } catch (error) {
        console.error(`[PhotoMarker] Error loading marker image for photo ${photo.id}:`, error);
        // 如果缓存失败，直接使用原始 URL
        setImageUri(photo.thumbnail_url);
      } finally {
        setIsLoading(false);
        console.log(`[PhotoMarker] Total loading time for photo ${photo.id}: ${Date.now() - startTime}ms`);
      }
    };

    loadImage();
  }, [photo]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.thumbnail}
          onLoadStart={() => {
            console.log(`[PhotoMarker] Image load started for photo: ${photo.id}`);
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            console.log(`[PhotoMarker] Image load completed for photo: ${photo.id}`);
            setIsLoading(false);
          }}
          onError={(error) => {
            console.error(`[PhotoMarker] Error loading image for photo ${photo.id}:`, error.nativeEvent);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
}); 