import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import lightTheme from './src/theme';

// 这里将来会导入导航组件
// import AppNavigator from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <NavigationContainer>
          {/* 这里将来会放置导航组件 */}
          {/* <AppNavigator /> */}
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
