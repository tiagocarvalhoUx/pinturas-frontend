import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, G, F } from '../theme';

const { width } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const scale   = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textY   = useRef(new Animated.Value(24)).current;
  const ring1   = useRef(new Animated.Value(0)).current;
  const ring2   = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(textY, { toValue: 0, duration: 800, delay: 350, useNativeDriver: true }),
    ]).start();

    // Pulsing rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Shimmer on accent bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, []);

  const ring1Scale   = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.35, 0.15, 0] });
  const ring2Scale   = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.25, 0.1, 0] });
  const shimmerOp    = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <LinearGradient
      colors={[C.bgDeep, C.bgBase, '#1A1610']}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Decorative amber glow behind logo */}
      <View style={{
        position: 'absolute',
        width: 220, height: 220,
        borderRadius: 110,
        backgroundColor: C.amber,
        opacity: 0.07,
      }} />

      {/* Pulsing rings */}
      <Animated.View style={{
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        borderWidth: 1.5, borderColor: C.amber,
        transform: [{ scale: ring1Scale }], opacity: ring1Opacity,
      }} />
      <Animated.View style={{
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        borderWidth: 1, borderColor: C.amberLight,
        transform: [{ scale: ring2Scale }], opacity: ring2Opacity,
      }} />

      {/* Logo container */}
      <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
        <View style={{
          width: 116, height: 116, borderRadius: 32,
          borderWidth: 2, borderColor: C.amber,
          overflow: 'hidden',
          shadowColor: C.amber, shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
        }}>
          <Image
            source={require('../../assets/logo-pintura.jpeg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {/* Amber overlay shimmer */}
          <Animated.View style={{
            position: 'absolute', inset: 0,
            backgroundColor: C.amber,
            opacity: Animated.multiply(shimmerOp, new Animated.Value(0.08)),
          }} />
        </View>
      </Animated.View>

      {/* Text block */}
      <Animated.View style={{
        alignItems: 'center', marginTop: 32,
        transform: [{ translateY: textY }], opacity,
      }}>
        {/* Amber rule */}
        <View style={{ width: 40, height: 2, backgroundColor: C.amber, borderRadius: 1, marginBottom: 14, opacity: 0.9 }} />
        <Text style={{
          fontSize: 22, fontWeight: '800', color: C.textPrimary,
          letterSpacing: 0.8, textAlign: 'center', fontFamily: F.base,
        }}>
          A. Coraça & T. Carvalho
        </Text>
        <Text style={{
          fontSize: 13, color: C.amber, marginTop: 6,
          letterSpacing: 3, fontWeight: '600', textTransform: 'uppercase', fontFamily: F.base,
        }}>
          Pinturas e Reformas
        </Text>
      </Animated.View>

      {/* Bottom tagline */}
      <View style={{ position: 'absolute', bottom: 52, alignItems: 'center' }}>
        <Text style={{ color: C.textDisabled, fontSize: 12, letterSpacing: 0.8, fontFamily: F.base }}>
          Qualidade que transforma ambientes
        </Text>
      </View>

      {/* Bottom amber bar */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, backgroundColor: C.amber, opacity: 0.6,
      }} />
    </LinearGradient>
  );
}
