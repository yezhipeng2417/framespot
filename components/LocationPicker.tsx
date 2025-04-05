import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SearchBar } from './SearchBar';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; name: string }) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const mapRef = useRef<MapView>(null);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get the address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationName = address[0]?.name || 
                          `${address[0]?.street}, ${address[0]?.city}, ${address[0]?.country}` ||
                          'Current Location';

      const newLocation = {
        latitude,
        longitude,
        name: locationName,
      };

      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);

      // Update map region
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationName = address[0]?.name || 
                          `${address[0]?.street}, ${address[0]?.city}, ${address[0]?.country}` ||
                          'Selected Location';

      const newLocation = {
        latitude,
        longitude,
        name: locationName,
      };

      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const newLocation = {
          latitude,
          longitude,
          name: searchQuery,
        };

        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }
      } else {
        Alert.alert('No Results', 'No locations found for your search');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for a location"
        onSubmitEditing={handleSearch}
      />

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
            />
          )}
        </MapView>
      </View>

      <TouchableOpacity 
        style={[styles.currentLocationButton, { backgroundColor: Colors[colorScheme].tint }]}
        onPress={getCurrentLocation}
        disabled={isLoading}
      >
        <IconSymbol 
          name="location.fill" 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>

      {selectedLocation && (
        <ThemedView style={styles.selectedLocationContainer}>
          <ThemedText style={styles.selectedLocationText}>
            {selectedLocation.name}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    height: 300,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  currentLocationButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedLocationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 