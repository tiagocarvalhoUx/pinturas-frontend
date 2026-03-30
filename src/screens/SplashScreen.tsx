import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(textY, { toValue: 0, duration: 700, delay: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(ring2, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, []);

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.2, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.15, 0] });

  return (
    <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Rings */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.15)',
          transform: [{ scale: ring1Scale }],
          opacity: ring1Opacity,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.1)',
          transform: [{ scale: ring2Scale }],
          opacity: ring2Opacity,
        }}
      />

      {/* Logo */}
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Image
          source={require('../../assets/logo-pintura.jpeg')}
          style={{
            width: 120, height: 120, borderRadius: 30,
            borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 16,
          }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Text */}
      <Animated.View style={{ alignItems: 'center', marginTop: 28, transform: [{ translateY: textY }], opacity }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 0.5 }}>
          A. Coraça & T. Carvalho
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 6, letterSpacing: 1 }}>
          Pinturas e Reformas
        </Text>
      </Animated.View>

      {/* Bottom tagline */}
      <View style={{ position: 'absolute', bottom: 48, alignItems: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: 0.5 }}>
          Qualidade que transforma ambientes
        </Text>
      </View>
    </LinearGradient>
  );
}
