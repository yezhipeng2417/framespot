import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function UploadScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
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
  
  const handleSubmit = () => {
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
    
    // In a real app, we would upload the image and data to the server here
    Alert.alert('Success', 'Your photo has been uploaded!');
    
    // Reset form
    setImage(null);
    setTitle('');
    setDescription('');
    setLocation('');
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
        
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholder="Location"
          placeholderTextColor={Colors[colorScheme].icon}
          value={location}
          onChangeText={setLocation}
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: Colors[colorScheme].tint }]} 
          onPress={handleSubmit}
        >
          <ThemedText style={styles.submitButtonText}>Upload</ThemedText>
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
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 