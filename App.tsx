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
    'Lora-Regular':      require('./assets/fonts/static/Lora-Regular.ttf'),
    'Lora-Italic':       require('./assets/fonts/static/Lora-Italic.ttf'),
    'Lora-Bold':         require('./assets/fonts/static/Lora-Bold.ttf'),
    'Lora-BoldItalic':   require('./assets/fonts/static/Lora-BoldItalic.ttf'),
    'Lora-Medium':       require('./assets/fonts/static/Lora-Medium.ttf'),
    'Lora-SemiBold':     require('./assets/fonts/static/Lora-SemiBold.ttf'),
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
