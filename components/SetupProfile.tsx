import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { updateUserProfile, uploadImage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 默认头像 URL - 使用 Gravatar 的默认头像
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export function SetupProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarError(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found when trying to update profile');
      setError('Authentication error. Please try again.');
      setIsLoading(false);
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting profile update...');
      let avatar_url = user.avatarUrl;

      // Upload new avatar if selected
      if (avatarUri) {
        console.log('Uploading new avatar...');
        const newAvatarUrl = await uploadImage(avatarUri, user.id, 'avatars');
        if (newAvatarUrl) {
          avatar_url = newAvatarUrl;
          console.log('Avatar uploaded successfully:', newAvatarUrl);
        }
      }

      // Update profile in Supabase
      console.log('Updating profile with data:', {
        id: user.id,
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url,
      });

      const updatedProfile = await updateUserProfile({
        id: user.id,
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url,
      });

      if (!updatedProfile) {
        throw new Error('Failed to update profile: No response from server');
      }

      console.log('Profile updated successfully:', updatedProfile);

      // Update local user state with all profile data
      setUser({
        id: user.id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        avatarUrl: updatedProfile.avatar_url,
      });
      
      // 使用正确的路径格式进行导航
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (err: any) {
      console.error('Profile setup error:', err);
      if (err.message?.includes('username')) {
        setError('This username is already taken');
      } else {
        setError('Failed to update profile: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Complete Your Profile</ThemedText>
      
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        <Image 
          source={{ 
            uri: avatarUri || DEFAULT_AVATAR,
            cache: 'force-cache',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }}
          style={styles.avatar}
          onError={(error) => {
            console.error('Avatar load error:', error.nativeEvent);
            setAvatarError(true);
            // 如果加载失败，尝试使用默认头像
            if (avatarUri) {
              console.log('Falling back to default avatar');
              setAvatarUri(DEFAULT_AVATAR);
            }
          }}
          onLoad={() => {
            console.log('Avatar loaded successfully:', avatarUri);
            setAvatarError(false);
          }}
          fadeDuration={300}
        />
        <ThemedText style={styles.avatarText}>Add Profile Photo</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Username *</ThemedText>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
          <ThemedText style={styles.hint}>At least 3 characters</ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Bio</ThemedText>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
            maxLength={160}
          />
          <ThemedText style={styles.hint}>{bio.length}/160</ThemedText>
        </ThemedView>

        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}

        <TouchableOpacity 
          style={[
            styles.submitButton,
            (isLoading || !username.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !username.trim()}
        >
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    marginTop: 60,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  avatarText: {
    color: '#007AFF',
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 