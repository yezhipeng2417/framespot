import React from 'react';
import { StyleSheet, View, Image, Dimensions, Platform, StatusBar } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from '../lib/auth';
import { ThemedText } from './ThemedText';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const { setUser } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    try {
      const user = await signInWithApple();
      setUser(user);
    } catch (error) {
      console.error(error);
    }
  };

  // 计算实际可用高度
  const availableHeight = height - insets.top - insets.bottom;
  
  // 调整位置比例以获得更好的视觉效果
  const logoPosition = availableHeight * 0.12; // 略微上移logo
  const titlePosition = availableHeight * 0.32; // 标题位置相应上移
  const featuresPosition = availableHeight * 0.48; // 特性列表位置微调
  const buttonPosition = availableHeight * 0.82; // 按钮位置略微下移

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#F8FDFF', '#E2F3FF', '#F1F7FF']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 内容容器 */}
        <View style={[styles.content, { paddingTop: insets.top }]}>
          {/* Logo */}
          <View style={[styles.logoContainer, { top: logoPosition }]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* 标题区域 */}
          <View style={[styles.titleContainer, { top: titlePosition }]}>
            <ThemedText style={styles.title}>FrameSpot</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your Perfect Shot Awaits
            </ThemedText>
          </View>

          {/* 特性列表 */}
          <View style={[styles.featureList, { top: featuresPosition }]}>
            <FeatureItem text="Discover unique photo locations" />
            <FeatureItem text="Share your favorite spots" />
            <FeatureItem text="Connect with photographers" />
          </View>

          {/* 底部按钮区域 */}
          <View style={[styles.bottomContent, { top: buttonPosition }]}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={16}
              style={styles.signInButton}
              onPress={handleSignIn}
            />
            <ThemedText style={styles.terms}>
              By continuing, you agree to our Terms & Privacy Policy
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.bullet} />
      <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    height: 120,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1B3A5C',
    lineHeight: 50,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    color: '#34495E',
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  featureList: {
    position: 'absolute',
    left: 40,
    right: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginRight: 12,
  },
  featureText: {
    fontSize: 17,
    color: '#2C3E50',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  bottomContent: {
    position: 'absolute',
    left: 32,
    right: 32,
  },
  signInButton: {
    width: '100%',
    height: 52,
    marginBottom: 16,
  },
  terms: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.85,
  },
}); 