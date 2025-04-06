import { StyleSheet, TouchableOpacity, Animated, Image, Dimensions, ScrollView, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Photo } from '@/lib/supabase';

interface PhotoDetailViewProps {
  selectedPhoto: Photo;
  detailVisible: boolean;
  onClose: () => void;
}

export const PhotoDetailView: React.FC<PhotoDetailViewProps> = ({
  selectedPhoto,
  detailVisible,
  onClose,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const detailAnimation = useRef(new Animated.Value(0)).current;

  const detailTranslateY = detailAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').height, 0],
  });

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    
    if (newIndex !== currentImageIndex) {
      setCurrentImageIndex(newIndex);
    }
  };

  const navigateToImage = (index: number) => {
    if (!scrollViewRef.current) return;
    
    scrollViewRef.current.scrollTo({
      x: index * screenWidth,
      animated: true
    });
    setCurrentImageIndex(index);
  };

  return (
    <Animated.View 
      style={[
        styles.photoDetailContainer,
        { transform: [{ translateY: detailTranslateY }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <IconSymbol name="xmark" size={20} color="#555" />
      </TouchableOpacity>
      
      <ThemedView style={styles.imagesStack}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.imageCarousel}
        >
          {selectedPhoto.image_urls.map((imageUrl, index) => (
            <View key={index} style={[styles.carouselImageContainer, { width: screenWidth }]}>
              <Image 
                source={{ uri: imageUrl }}
                style={styles.mainImage}
                resizeMode="cover"
                onError={(e) => console.log('error:', e.nativeEvent.error)}
                fadeDuration={300}
              />
            </View>
          ))}
        </ScrollView>
        
        {selectedPhoto.image_urls.length > 1 && (
          <View style={styles.carouselDots}>
            {selectedPhoto.image_urls.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToImage(index)}
              >
                <View 
                  style={[
                    styles.dot, 
                    index === currentImageIndex && styles.activeDot
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ThemedView>
      
      <ScrollView style={styles.detailsContainer}>
        <ThemedText type="title">{selectedPhoto.title}</ThemedText>
        
        <ThemedView style={styles.locationRow}>
          <IconSymbol name="location.fill" size={16} color="#555" />
          <ThemedText style={styles.locationText}>{selectedPhoto.location.name}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.userRow}>
          <Image 
            source={{ uri: selectedPhoto.profiles?.avatar_url || 'https://via.placeholder.com/32' }} 
            style={styles.userAvatar}
          />
          <ThemedText style={styles.userName}>{selectedPhoto.profiles?.username || 'Unknown User'}</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.description}>{selectedPhoto.description}</ThemedText>
        
        <ThemedView style={styles.statsRow}>
          <ThemedText style={styles.dateText}>
            {new Date(selectedPhoto.created_at).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  photoDetailContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imagesStack: {
    height: '40%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageCarousel: {
    width: '100%',
    height: '100%',
  },
  carouselImageContainer: {
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    marginLeft: 8,
    fontWeight: '500',
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#777',
  },
  carouselDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}); 