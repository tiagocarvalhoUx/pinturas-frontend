import './global.css';
import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppNavigator } from './src/navigation';
import { AppSplash } from './src/components/AppSplash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'Philosopher':            require('./assets/fonts/Philosopher-Regular.ttf'),
    'Philosopher-Bold':       require('./assets/fonts/Philosopher-Bold.ttf'),
    'Philosopher-Italic':     require('./assets/fonts/Philosopher-Italic.ttf'),
    'Philosopher-BoldItalic': require('./assets/fonts/Philosopher-BoldItalic.ttf'),
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
        {showSplash && <AppSplash onDone={() => setShowSplash(false)} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
