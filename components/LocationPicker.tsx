import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; name: string }) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission to access location was denied');
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

      onLocationSelect({
        latitude,
        longitude,
        name: locationName,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Error getting location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
        onPress={getCurrentLocation}
        disabled={isLoading}
      >
        <IconSymbol 
          name="location.fill" 
          size={20} 
          color="white" 
        />
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Getting Location...' : 'Use Current Location'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 