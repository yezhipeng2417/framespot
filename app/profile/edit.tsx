import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, uploadImage } from '@/lib/supabase';
import type { UserProfile } from '@/lib/supabase';

// 默认头像 URL - 使用 Gravatar 的默认头像
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profileData = await getUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || '');
        setFullName(profileData.full_name || '');
        setBio(profileData.bio || '');
        setAvatarUri(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let avatar_url = profile.avatar_url;

      // Upload new avatar if changed
      if (avatarUri && avatarUri !== profile.avatar_url) {
        const newAvatarUrl = await uploadImage(avatarUri, user.id, 'avatars');
        if (newAvatarUrl) {
          avatar_url = newAvatarUrl;
        }
      }

      // Update profile in Supabase
      await updateUserProfile({
        id: user.id,
        username: username.trim(),
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url,
      });

      router.back();
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="xmark" size={24} color="#555" />
        </TouchableOpacity>
        <ThemedText type="title">Edit Profile</ThemedText>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isLoading}
        >
          <ThemedText 
            style={[
              styles.saveButton, 
              isLoading && styles.saveButtonDisabled
            ]}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image 
            source={{ 
              uri: avatarUri || profile?.avatar_url || DEFAULT_AVATAR,
              cache: 'force-cache',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }} 
            style={styles.avatar}
            onError={(error) => {
              console.error('Avatar load error:', {
                error: error.nativeEvent,
                attemptedUrl: avatarUri || profile?.avatar_url || DEFAULT_AVATAR
              });
              // 如果是自定义头像加载失败，尝试使用个人资料头像或默认头像
              if (avatarUri && avatarUri !== profile?.avatar_url) {
                setAvatarUri(profile?.avatar_url || DEFAULT_AVATAR);
              }
            }}
            onLoad={() => {
              console.log('Avatar loaded successfully:', {
                url: avatarUri || profile?.avatar_url || DEFAULT_AVATAR,
                isDefaultAvatar: (avatarUri || profile?.avatar_url) === DEFAULT_AVATAR
              });
            }}
            fadeDuration={300}
          />
          <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
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
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />
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
            />
          </ThemedView>

          {error && (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 15,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
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
  errorText: {
    color: '#FF3B30',
    marginTop: 16,
  },
}); 