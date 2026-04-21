import './global.css';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppNavigator } from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'Alice': require('./assets/fonts/Alice-Regular.ttf'),
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
