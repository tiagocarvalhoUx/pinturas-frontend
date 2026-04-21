import './global.css';
import React, { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './src/navigation';

// Mantém o splash nativo visível até o app estar pronto
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'StardosStencil':      require('./assets/fonts/StardosStencil-Regular.ttf'),
    'StardosStencil-Bold': require('./assets/fonts/StardosStencil-Bold.ttf'),
  });

  const onReady = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => { onReady(); }, [onReady]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
