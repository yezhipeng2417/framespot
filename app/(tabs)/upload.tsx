import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, Alert, View, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LocationPicker } from '@/components/LocationPicker';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabase';

export default function UploadScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFirework, setShowFirework] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const fireworkAnim = useRef<LottieView>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
              onChangeText={(text) => {
                setDescription(text);
                if (text.length > 0) {
                  // 延迟收起，让用户看到输入的内容
                  setTimeout(() => setIsDescriptionExpanded(false), 1000);
                }
              }}
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

          <View style={styles.spacer} />
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
    paddingBottom: 100, // 为按钮留出空间
  },
  title: {
    marginBottom: 20,
  },
  imageContainer: {
    height: 150, // 减小图片容器高度
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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