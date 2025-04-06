import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ReturnToLocationButtonProps {
  showReturnButton: boolean;
  returnButtonAnimation: Animated.Value;
  onPress: () => void;
}

export const ReturnToLocationButton: React.FC<ReturnToLocationButtonProps> = ({
  showReturnButton,
  returnButtonAnimation,
  onPress,
}) => {
  if (!showReturnButton) return null;

  return (
    <Animated.View 
      style={[
        styles.returnButtonContainer,
        {
          opacity: returnButtonAnimation,
          transform: [{ translateY: returnButtonAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0]
          })}]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.returnButton}
        onPress={onPress}
      >
        <IconSymbol name="location.fill" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  returnButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  returnButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 