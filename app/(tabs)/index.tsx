import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PhotoMarker } from '@/components/PhotoMarker';
import { dummyPhotos } from '@/constants/DummyData';
import { Photo } from '@/types/types';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Animation values
  const exploreAnimation = useRef(new Animated.Value(0)).current;
  const profileAnimation = useRef(new Animated.Value(0)).current;
  
  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
  
  // Calculate animations
  const exploreTranslateY = exploreAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });
  
  const profileTranslateY = profileAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });
  
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
      >
        {dummyPhotos.map((photo: Photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.location.latitude,
              longitude: photo.location.longitude,
            }}
            onPress={() => setSelectedPhoto(photo)}
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
          onPress={() => {
            setMenuOpen(false);
            router.push('/profile');
          }}
        >
          <IconSymbol name="person.fill" size={22} color="#555" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Upload button (always visible) */}
      <TouchableOpacity 
        style={[styles.fabBottomRight]} 
        onPress={() => router.push('/upload')}
      >
        <IconSymbol name="plus.circle.fill" size={28} color="#555" />
      </TouchableOpacity>
      
      {selectedPhoto && (
        <ThemedView style={styles.photoPreview}>
          <ThemedText type="subtitle">{selectedPhoto.title}</ThemedText>
        </ThemedView>
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
});
