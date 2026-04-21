import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppNavigator } from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'Onest':          require('./assets/fonts/static/Onest-Regular.ttf'),
    'Onest-Medium':   require('./assets/fonts/static/Onest-Medium.ttf'),
    'Onest-SemiBold': require('./assets/fonts/static/Onest-SemiBold.ttf'),
    'Onest-Bold':     require('./assets/fonts/static/Onest-Bold.ttf'),
    'Onest-ExtraBold':require('./assets/fonts/static/Onest-ExtraBold.ttf'),
    'Onest-Black':    require('./assets/fonts/static/Onest-Black.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
