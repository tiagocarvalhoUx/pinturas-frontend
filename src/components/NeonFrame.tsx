/**
 * NeonFrame — decorative glowing vertical side bars
 * Wraps any screen content and adds futuristic neon side decorations.
 * Usage: <NeonFrame><ScrollView>...</ScrollView></NeonFrame>
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

// Each bar definition: side, top offset, height, color, opacity, width
const BARS = [
  // ── LEFT SIDE ──
  { side: 'left',  top: 0,              h: SCREEN_H * 0.55, color: C.amber,      opacity: 0.85, w: 2,   x: 0   },
  { side: 'left',  top: SCREEN_H * 0.1, h: SCREEN_H * 0.30, color: C.terra,      opacity: 0.70, w: 1.5, x: 5   },
  { side: 'left',  top: SCREEN_H * 0.3, h: SCREEN_H * 0.20, color: C.amberLight, opacity: 0.50, w: 1,   x: 10  },
  { side: 'left',  top: SCREEN_H * 0.5, h: SCREEN_H * 0.15, color: C.terra,      opacity: 0.40, w: 1,   x: 14  },

  // ── RIGHT SIDE ──
  { side: 'right', top: SCREEN_H * 0.15, h: SCREEN_H * 0.55, color: C.amber,      opacity: 0.85, w: 2,   x: 0   },
  { side: 'right', top: SCREEN_H * 0.05, h: SCREEN_H * 0.30, color: C.terra,      opacity: 0.70, w: 1.5, x: 5   },
  { side: 'right', top: SCREEN_H * 0.35, h: SCREEN_H * 0.20, color: C.amberLight, opacity: 0.50, w: 1,   x: 10  },
  { side: 'right', top: SCREEN_H * 0.55, h: SCREEN_H * 0.12, color: C.terra,      opacity: 0.40, w: 1,   x: 14  },
] as const;

export function NeonFrame({ children }: Props) {
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      {children}

      {/* ── Neon side bars (pointer-events none so they don't block touches) ── */}
      <View style={styles.overlay} pointerEvents="none">
        {BARS.map((bar, i) => {
          const isLeft = bar.side === 'left';
          const posStyle = isLeft
            ? { left: bar.x, top: bar.top }
            : { right: bar.x, top: bar.top };

          return (
            <Animated.View
              key={i}
              style={[
                styles.barWrapper,
                posStyle,
                {
                  width: bar.w,
                  height: bar.h,
                  opacity: Animated.multiply(pulse, bar.opacity),
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  bar.color + 'CC',
                  bar.color,
                  bar.color + 'CC',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Glow halo */}
              <View style={[
                styles.glow,
                {
                  shadowColor: bar.color,
                  left: isLeft ? -4 : undefined,
                  right: isLeft ? undefined : -4,
                },
              ]} />
            </Animated.View>
          );
        })}

        {/* Horizontal tick marks — left */}
        {[0.12, 0.38, 0.62].map((pct, i) => (
          <View key={`lt${i}`} style={[styles.tick, { top: SCREEN_H * pct, left: 0 }]} />
        ))}
        {/* Horizontal tick marks — right */}
        {[0.22, 0.50, 0.74].map((pct, i) => (
          <View key={`rt${i}`} style={[styles.tick, styles.tickRight, { top: SCREEN_H * pct, right: 0 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  barWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '10%',
    width: 12,
    height: '80%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  tick: {
    position: 'absolute',
    width: 10,
    height: 1.5,
    backgroundColor: C.amber,
    opacity: 0.7,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  tickRight: {
    backgroundColor: C.terra,
    shadowColor: C.terra,
  },
});
