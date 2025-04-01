import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from '../lib/auth';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
  const { setUser } = useAuth();

  const handleSignIn = async () => {
    try {
      const user = await signInWithApple();
      setUser(user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Welcome to FrameSpot</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to discover amazing photo spots
        </ThemedText>
      </View>
      
      <View style={styles.footer}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.button}
          onPress={handleSignIn}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  button: {
    width: '100%',
    height: 48,
  },
}); 