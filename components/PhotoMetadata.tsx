import { StyleSheet, View } from 'react-native';
import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Photo } from '@/lib/supabase';

interface PhotoMetadataProps {
  metadata: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    resolution?: string;
    whiteBalance?: string;
    brightness?: string;
    dateTime?: string;
  };
}

export const PhotoMetadata: React.FC<PhotoMetadataProps> = ({ metadata }) => {
  return (
    <ThemedView style={styles.metadataContainer}>
      <ThemedText type="subtitle" style={styles.metadataTitle}>Photo Details</ThemedText>
      
      <View style={styles.metadataGrid}>
        {metadata.camera && (
          <View style={styles.metadataItem}>
            <IconSymbol name="camera" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.camera}</ThemedText>
          </View>
        )}
        
        {metadata.lens && (
          <View style={styles.metadataItem}>
            <IconSymbol name="camera.aperture" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.lens}</ThemedText>
          </View>
        )}
        
        {metadata.focalLength && (
          <View style={styles.metadataItem}>
            <IconSymbol name="camera.viewfinder" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.focalLength}</ThemedText>
          </View>
        )}
        
        {metadata.aperture && (
          <View style={styles.metadataItem}>
            <IconSymbol name="camera.aperture" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.aperture}</ThemedText>
          </View>
        )}
        
        {metadata.shutterSpeed && (
          <View style={styles.metadataItem}>
            <IconSymbol name="timer" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.shutterSpeed}</ThemedText>
          </View>
        )}
        
        {metadata.iso && (
          <View style={styles.metadataItem}>
            <IconSymbol name="light.max" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.iso}</ThemedText>
          </View>
        )}
        
        {metadata.resolution && (
          <View style={styles.metadataItem}>
            <IconSymbol name="photo" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.resolution}</ThemedText>
          </View>
        )}
        
        {metadata.whiteBalance && (
          <View style={styles.metadataItem}>
            <IconSymbol name="lightbulb" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>WB: {metadata.whiteBalance}</ThemedText>
          </View>
        )}
        
        {metadata.brightness && (
          <View style={styles.metadataItem}>
            <IconSymbol name="sun.max" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>Brightness: {metadata.brightness}</ThemedText>
          </View>
        )}
        
        {metadata.dateTime && (
          <View style={styles.metadataItem}>
            <IconSymbol name="calendar" size={16} color="#555" />
            <ThemedText style={styles.metadataText}>{metadata.dateTime}</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  metadataContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 16,
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
}); 