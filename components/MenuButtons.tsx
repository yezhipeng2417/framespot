import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useRef } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

interface MenuButtonsProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onProfilePress: () => void;
}

export const MenuButtons: React.FC<MenuButtonsProps> = ({
  menuOpen,
  onToggleMenu,
  onProfilePress,
}) => {
  const router = useRouter();
  const exploreAnimation = useRef(new Animated.Value(0)).current;
  const profileAnimation = useRef(new Animated.Value(0)).current;

  const exploreTranslateY = exploreAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });
  
  const profileTranslateY = profileAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  React.useEffect(() => {
    if (menuOpen) {
      Animated.sequence([
        Animated.timing(exploreAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(exploreAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuOpen]);

  return (
    <>
      <TouchableOpacity 
        style={[styles.fabMenu]} 
        onPress={onToggleMenu}
      >
        <IconSymbol name="ellipsis" size={22} color="#555" />
      </TouchableOpacity>
      
      <Animated.View style={[
        styles.fabMenuItem,
        { 
          transform: [{ translateY: exploreTranslateY }],
          opacity: exploreAnimation,
          left: 20,
        }
      ]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            onToggleMenu();
            router.push('/explore');
          }}
        >
          <IconSymbol name="photo.on.rectangle" size={22} color="#555" />
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={[
        styles.fabMenuItem,
        { 
          transform: [{ translateY: profileTranslateY }],
          opacity: profileAnimation,
          left: 20,
        }
      ]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={onProfilePress}
        >
          <IconSymbol name="person.crop.circle" size={22} color="#555" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fabMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 100,
  },
  fabMenuItem: {
    position: 'absolute',
    top: 50,
    zIndex: 99,
  },
  fabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
}); 