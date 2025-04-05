import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, Alert, View, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LocationPicker } from '@/components/LocationPicker';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabase';

interface ExifData {
  ApertureValue?: number;
  BrightnessValue?: number;
  DateTime?: string;
  DateTimeOriginal?: string;
  ExposureTime?: number;
  FNumber?: number;
  FocalLength?: number;
  FocalLenIn35mmFilm?: number;
  ISOSpeedRatings?: number[];
  Make?: string;
  Model?: string;
  PixelXDimension?: number;
  PixelYDimension?: number;
  ShutterSpeedValue?: number;
  WhiteBalance?: number;
}

interface PhotoMetadata {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  dateTime?: string;
  device?: string;
  software?: string;
  resolution?: string;
  whiteBalance?: string;
  brightness?: string;
}

export default function UploadScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFirework, setShowFirework] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PhotoMetadata | null>(null);
  const fireworkAnim = useRef<LottieView>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('Requesting media library permissions...');
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      console.log('Media library permission status:', mediaStatus);
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to upload photos');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const pickImage = async () => {
    try {
      console.log('Checking media library permissions...');
      const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
      console.log('Current media library permission status:', mediaStatus);
      
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to upload photos');
        return;
      }

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: true,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Selected asset:', selectedAsset);
        
        setImage(selectedAsset.uri);
        
        if (selectedAsset.exif) {
          const exif = selectedAsset.exif as ExifData;
          console.log('EXIF data:', exif);
          
          const newMetadata: PhotoMetadata = {};
          
          // Only add valid metadata
          if (exif?.Model || exif?.Make) {
            newMetadata.camera = exif.Model || exif.Make;
          }
          
          if (exif?.Model && exif?.Make) {
            newMetadata.lens = `${exif.Make} ${exif.Model}`;
          }
          
          if (exif?.FocalLength && exif?.FocalLenIn35mmFilm) {
            newMetadata.focalLength = `${exif.FocalLength}mm (${exif.FocalLenIn35mmFilm}mm equivalent)`;
          }
          
          if (exif?.FNumber) {
            newMetadata.aperture = `f/${exif.FNumber}`;
          }
          
          if (exif?.ExposureTime) {
            newMetadata.shutterSpeed = `1/${Math.round(1/exif.ExposureTime)}s`;
          }
          
          if (exif?.ISOSpeedRatings && exif.ISOSpeedRatings.length > 0) {
            newMetadata.iso = `ISO ${exif.ISOSpeedRatings[0]}`;
          }
          
          if (exif?.DateTime) {
            try {
              // EXIF date format is "YYYY:MM:DD HH:MM:SS"
              const [datePart, timePart] = exif.DateTime.split(' ');
              const [year, month, day] = datePart.split(':');
              const [hour, minute] = timePart.split(':');
              
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              const dayName = days[date.getDay()];
              const monthName = months[parseInt(month) - 1];
              
              const hourNum = parseInt(hour);
              const ampm = hourNum >= 12 ? 'pm' : 'am';
              const hour12 = hourNum % 12 || 12;
              
              newMetadata.dateTime = `${dayName}·${day} ${monthName} ${year}·${hour12}:${minute} ${ampm}`;
            } catch (error) {
              console.error('Error formatting date:', error);
            }
          }
          
          if (exif?.PixelXDimension && exif?.PixelYDimension) {
            newMetadata.resolution = `${exif.PixelXDimension} x ${exif.PixelYDimension}`;
          }
          
          if (exif?.WhiteBalance !== undefined) {
            newMetadata.whiteBalance = exif.WhiteBalance === 0 ? 'Auto' : 'Manual';
          }
          
          if (exif?.BrightnessValue !== undefined) {
            newMetadata.brightness = `${exif.BrightnessValue.toFixed(2)}`;
          }
          
          console.log('Processed metadata:', newMetadata);
          setMetadata(newMetadata);
        } else {
          console.log('No EXIF data found');
          setMetadata(null);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to load image metadata');
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }
    
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!location) {
      Alert.alert('Error', 'Please specify a location');
      return;
    }

    try {
      setIsUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload image to storage
      const uploadResult = await uploadImage(image, user.id);
      if (!uploadResult) {
        throw new Error('Failed to upload image');
      }

      // Create photo record
      const { data: photo, error } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          title,
          description,
          location,
          image_urls: [uploadResult.originalUrl],
          thumbnail_url: uploadResult.thumbnailUrl || uploadResult.originalUrl,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating photo record:', error);
        throw error;
      }

      // Show firework animation
      setShowFirework(true);
      if (fireworkAnim.current) {
        fireworkAnim.current.play();
      }

      // Reset form after a delay
      setTimeout(() => {
        setImage(null);
        setTitle('');
        setDescription('');
        setLocation(null);
        setMetadata(null);
        setShowFirework(false);
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      let errorMessage = 'Failed to upload photo. Please try again.';
      
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Permission denied. Please make sure you are logged in.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please try logging in again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>Share a Photo</ThemedText>
        
        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {image ? (
              <Image 
                source={{ uri: image }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <ThemedView style={styles.placeholderContainer}>
                <IconSymbol 
                  name="photo.on.rectangle" 
                  size={40} 
                  color={Colors[colorScheme].icon} 
                />
                <ThemedText>Tap to select a photo</ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          {/* Photo Metadata Display */}
          {metadata && (
            <ThemedView style={styles.metadataContainer}>
              <ThemedText type="subtitle" style={styles.metadataTitle}>Photo Details</ThemedText>
              
              <View style={styles.metadataGrid}>
                {metadata.camera && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="camera" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.camera}</ThemedText>
                  </View>
                )}
                
                {metadata.lens && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="camera.aperture" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.lens}</ThemedText>
                  </View>
                )}
                
                {metadata.focalLength && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="camera.viewfinder" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.focalLength}</ThemedText>
                  </View>
                )}
                
                {metadata.aperture && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="camera.aperture" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.aperture}</ThemedText>
                  </View>
                )}
                
                {metadata.shutterSpeed && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="timer" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.shutterSpeed}</ThemedText>
                  </View>
                )}
                
                {metadata.iso && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="light.max" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.iso}</ThemedText>
                  </View>
                )}
                
                {metadata.resolution && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="photo" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>{metadata.resolution}</ThemedText>
                  </View>
                )}
                
                {metadata.whiteBalance && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="lightbulb" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>WB: {metadata.whiteBalance}</ThemedText>
                  </View>
                )}
                
                {metadata.brightness && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="sun.max" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>Brightness: {metadata.brightness}</ThemedText>
                  </View>
                )}
                
                {metadata.dateTime && (
                  <View style={styles.metadataItem}>
                    <IconSymbol name="calendar" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.metadataText}>
                      {metadata.dateTime}
                    </ThemedText>
                  </View>
                )}
              </View>
            </ThemedView>
          )}
        </View>
        
        <ThemedView style={styles.formContainer}>
          <TextInput
            style={[styles.input, { color: Colors[colorScheme].text }]}
            placeholder="Title"
            placeholderTextColor={Colors[colorScheme].icon}
            value={title}
            onChangeText={setTitle}
          />
          
          <TouchableOpacity 
            style={styles.descriptionButton}
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <ThemedText style={styles.descriptionButtonText}>
              {isDescriptionExpanded ? 'Description (click to collapse)' : 'Add Description (optional)'}
            </ThemedText>
            <IconSymbol 
              name={isDescriptionExpanded ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={Colors[colorScheme].icon} 
            />
          </TouchableOpacity>

          {isDescriptionExpanded && (
            <TextInput
              style={[styles.input, styles.descriptionInput, { color: Colors[colorScheme].text }]}
              placeholder="Write your description here..."
              placeholderTextColor={Colors[colorScheme].icon}
              value={description}
              onChangeText={setDescription}
              multiline
              autoFocus
            />
          )}
          
          <LocationPicker onLocationSelect={setLocation} />
          
          {location && (
            <ThemedText style={styles.locationText}>
              Selected Location: {location.name}
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          { 
            backgroundColor: Colors[colorScheme].tint,
            opacity: isUploading ? 0.7 : 1
          }
        ]}
        onPress={handleSubmit}
        disabled={isUploading}
      >
        <ThemedText style={styles.submitButtonText}>
          {isUploading ? 'Uploading...' : 'Submit'}
        </ThemedText>
      </TouchableOpacity>

      {/* Firework Animation */}
      {showFirework && (
        <View style={styles.fireworkContainer}>
          <LottieView
            ref={fireworkAnim}
            source={require('@/assets/animations/firework.json')}
            autoPlay={false}
            loop={false}
            style={styles.firework}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  mainContent: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 20,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  descriptionButtonText: {
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  metadataContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
  spacer: {
    height: 20,
  },
  submitButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  fireworkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  firework: {
    width: '100%',
    height: '100%',
  },
}); 