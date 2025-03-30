import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Photo } from '@/types/types';

export function PhotoMarker({ photo }: { photo: Photo }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.thumbnailUrl }} style={styles.thumbnail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
}); 