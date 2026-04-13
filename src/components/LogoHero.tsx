import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, SH } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { img: 52,  frame: 76,  corner: 12 },
  md: { img: 72,  frame: 100, corner: 14 },
  lg: { img: 96,  frame: 130, corner: 16 },
};

export function LogoHero({ size = 'md' }: Props) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  // Continuous pulse glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const s = SIZES[size];

  return (
    <View style={styles.wrapper}>
      {/* Outer ambient rings */}
      <Animated.View style={[styles.ring, styles.ringOuter, { opacity: pulse, transform: [{ scale: pulse }] }]} />
      <Animated.View style={[styles.ring, styles.ringInner, { opacity: pulse }]} />

      {/* Frame container */}
      <View style={[
        styles.frame,
        { width: s.frame, height: s.frame, borderRadius: R.lg },
        SH.neon,
      ]}>
        {/* Gradient background inside frame */}
        <LinearGradient
          colors={[C.bgElevated, C.bgSurface]}
          style={[StyleSheet.absoluteFill, { borderRadius: R.lg }]}
        />

        {/* Neon border */}
        <View style={[styles.border, { borderRadius: R.lg }]} />

        {/* Corner accents — top-left (violet) */}
        <View style={[styles.corner, styles.cornerTL, { width: s.corner, height: s.corner }]} />
        {/* Corner accents — top-right (blue) */}
        <View style={[styles.corner, styles.cornerTR, { width: s.corner, height: s.corner, borderColor: C.terra }]} />
        {/* Corner accents — bottom-left (blue) */}
        <View style={[styles.corner, styles.cornerBL, { width: s.corner, height: s.corner, borderColor: C.terra }]} />
        {/* Corner accents — bottom-right (violet) */}
        <View style={[styles.corner, styles.cornerBR, { width: s.corner, height: s.corner }]} />

        {/* Logo image */}
        <Image
          source={require('../../assets/logo-pintura.png')}
          style={{ width: s.img, height: s.img }}
          resizeMode="contain"
        />
      </View>

      {/* Bottom scan line */}
      <Animated.View style={[styles.scanLine, { opacity: pulse }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ringOuter: {
    width: 160, height: 160,
    borderColor: C.amber + '18',
  },
  ringInner: {
    width: 120, height: 120,
    borderColor: C.amber + '30',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: C.amber + '70',
  },
  corner: {
    position: 'absolute',
    borderColor: C.amber,
  },
  cornerTL: {
    top: -1, left: -1,
    borderTopWidth: 2.5, borderLeftWidth: 2.5,
    borderTopLeftRadius: R.lg,
  },
  cornerTR: {
    top: -1, right: -1,
    borderTopWidth: 2.5, borderRightWidth: 2.5,
    borderTopRightRadius: R.lg,
  },
  cornerBL: {
    bottom: -1, left: -1,
    borderBottomWidth: 2.5, borderLeftWidth: 2.5,
    borderBottomLeftRadius: R.lg,
  },
  cornerBR: {
    bottom: -1, right: -1,
    borderBottomWidth: 2.5, borderRightWidth: 2.5,
    borderBottomRightRadius: R.lg,
  },
  scanLine: {
    marginTop: 10,
    width: 80,
    height: 1.5,
    backgroundColor: C.amber,
    borderRadius: 2,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});
