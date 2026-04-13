import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, SH } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { imgW: 68,  imgH: 68,  frameW: 92,  frameH: 92,  corner: 12 },
  md: { imgW: 100, imgH: 100, frameW: 128, frameH: 128, corner: 16 },
  lg: { imgW: 130, imgH: 130, frameW: 160, frameH: 160, corner: 18 },
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
        { width: s.frameW, height: s.frameH, borderRadius: R.lg },
        SH.neon,
      ]}>
        {/* Fundo branco — igual ao bg do logo, preenche cantos */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#ffffff', borderRadius: R.lg }]} />

        {/* Logo image — preenche o frame inteiro */}
        <Image
          source={require('../../src/image/logo-pintura.png')}
          style={{ width: s.frameW, height: s.frameH }}
          resizeMode="contain"
        />

        {/* Neon border (por cima da imagem) */}
        <View style={[styles.border, { borderRadius: R.lg }]} />

        {/* Corner accents — top-left (violet) */}
        <View style={[styles.corner, styles.cornerTL, { width: s.corner, height: s.corner }]} />
        {/* Corner accents — top-right (blue) */}
        <View style={[styles.corner, styles.cornerTR, { width: s.corner, height: s.corner, borderColor: C.terra }]} />
        {/* Corner accents — bottom-left (blue) */}
        <View style={[styles.corner, styles.cornerBL, { width: s.corner, height: s.corner, borderColor: C.terra }]} />
        {/* Corner accents — bottom-right (violet) */}
        <View style={[styles.corner, styles.cornerBR, { width: s.corner, height: s.corner }]} />
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
    width: 200, height: 200,
    borderColor: C.amber + '18',
  },
  ringInner: {
    width: 160, height: 160,
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
