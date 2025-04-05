import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/SearchBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Photo, getPhotos } from '@/lib/supabase';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = width / numColumns - 16;

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhotos() {
      try {
        // 获取用户当前位置
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // 获取附近的照片
        const fetchedPhotos = await getPhotos(latitude, longitude);
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPhotos();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Explore</ThemedText>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search photos, locations..." 
        />
      </ThemedView>
      
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.tile}>
            <Image source={{ uri: item.image_urls[0] }} style={styles.image} />
            <ThemedView style={styles.infoContainer}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
              <ThemedView style={styles.locationContainer}>
                <IconSymbol 
                  name="location.fill" 
                  size={12} 
                  color={Colors[colorScheme].icon} 
                />
                <ThemedText style={styles.locationText} numberOfLines={1}>
                  {item.location.name}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  list: {
    padding: 8,
    alignItems: 'center',
  },
  tile: {
    margin: 8,
    width: tileSize,
    height: tileSize * 1.3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '75%',
  },
  infoContainer: {
    padding: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
