import React from 'react';
import { StyleSheet, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { dummyUsers, dummyPhotos } from '@/constants/DummyData';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns - 4;

export default function ProfileScreen() {
  // Using the first dummy user for now
  const user = dummyUsers[0];
  const userPhotos = dummyPhotos.filter(photo => photo.user.id === user.id);
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="title">{user.photosCount}</ThemedText>
            <ThemedText>Photos</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedText type="title">{user.followersCount}</ThemedText>
            <ThemedText>Followers</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedText type="title">{user.followingCount}</ThemedText>
            <ThemedText>Following</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.bioContainer}>
          <ThemedText type="defaultSemiBold">{user.name}</ThemedText>
          <ThemedText>@{user.username}</ThemedText>
          <ThemedText style={styles.bio}>{user.bio}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <FlatList
        data={userPhotos}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.photoTile}>
            <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.photosList}
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
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bio: {
    marginTop: 4,
  },
  photosList: {
    padding: 2,
  },
  photoTile: {
    width: tileSize,
    height: tileSize,
    margin: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
}); 