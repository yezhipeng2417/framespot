import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

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
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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

      Alert.alert('Success', 'Your photo has been uploaded!');
      
      // Reset form
      setImage(null);
      setTitle('');
      setDescription('');
      setLocation(null);
      
      // Navigate back to home
      router.back();
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
      <ThemedText type="title" style={styles.title}>Share a Photo</ThemedText>
      
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
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
        
        <TextInput
          style={[styles.input, styles.descriptionInput, { color: Colors[colorScheme].text }]}
          placeholder="Description (optional)"
          placeholderTextColor={Colors[colorScheme].icon}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <LocationPicker onLocationSelect={setLocation} />
        
        {location && (
          <ThemedText style={styles.locationText}>
            Selected Location: {location.name}
          </ThemedText>
        )}
        
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: Colors[colorScheme].tint },
            isUploading && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={isUploading}
        >
          <ThemedText style={styles.submitButtonText}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 20,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
    backgroundColor: '#f0f0f0',
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
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 