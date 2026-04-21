import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export function AppSplash({ onDone }: Props) {
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenFade  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Fade + scale logo in
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1,   tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ]),
      // 2. Hold for 1.2s
      Animated.delay(1200),
      // 3. Fade out entire splash
      Animated.timing(screenFade, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, { opacity: screenFade }]}>
      {/* Glow blob */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.Image
        source={require('../image/logo-pintura.png')}
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#8A2BE2',
    // soft purple glow blur effect via shadow
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 30,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
