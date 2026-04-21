import React, { useState, useRef } from 'react';
import { View, Text, Image, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R } from '../theme';

interface Props {
  before: string;
  after: string;
  width: number;
  height: number;
  /** true = claim responder on tap (detail view); false = only on drag (card/scroll view) */
  captureOnStart?: boolean;
}

export function BeforeAfterSlider({ before, after, width, height, captureOnStart = false }: Props) {
  const [sliderPos, setSliderPos] = useState(0.5);
  const [hinted, setHinted] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => captureOnStart,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: (e) => {
        setHinted(true);
        const x = e.nativeEvent.locationX;
        setSliderPos(Math.max(0.02, Math.min(x / width, 0.98)));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        setSliderPos(Math.max(0.02, Math.min(x / width, 0.98)));
      },
    })
  ).current;

  const dividerX = sliderPos * width;
  const handleSize = height < 180 ? 32 : 40;
  const iconSize   = height < 180 ? 13 : 17;
  const labelSize  = height < 180 ? 8 : 10;
  const labelPad   = height < 180 ? { px: 8, py: 3 } : { px: 12, py: 5 };

  return (
    <View style={{ width, height, overflow: 'hidden' }} {...panResponder.panHandlers}>
      {/* ANTES — camada base (direita) */}
      <Image source={{ uri: before }} style={{ position: 'absolute', width, height }} resizeMode="cover" />

      {/* DEPOIS — camada clipada (esquerda) */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: dividerX, height, overflow: 'hidden' }}>
        <Image source={{ uri: after }} style={{ width, height }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(138,43,226,0.06)' }} pointerEvents="none" />
      </View>

      {/* Linha divisória */}
      <View style={{
        position: 'absolute', top: 0, bottom: 0,
        left: dividerX - 1, width: 2,
        backgroundColor: 'rgba(255,255,255,0.92)',
        shadowColor: C.amber, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
      }} pointerEvents="none" />

      {/* Handle circular */}
      <View style={{
        position: 'absolute',
        top: height / 2 - handleSize / 2,
        left: dividerX - handleSize / 2,
        width: handleSize, height: handleSize, borderRadius: handleSize / 2,
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
        elevation: 8, borderWidth: 2, borderColor: C.amber + 'AA',
      }} pointerEvents="none">
        <Ionicons name="swap-horizontal" size={iconSize} color={C.amber} />
      </View>

      {/* Label DEPOIS (esquerda) */}
      <View style={{
        position: 'absolute', bottom: 8, left: 8,
        backgroundColor: C.amber + 'DD',
        borderRadius: R.full,
        paddingHorizontal: labelPad.px, paddingVertical: labelPad.py,
      }} pointerEvents="none">
        <Text style={{ color: '#fff', fontSize: labelSize, fontWeight: '800', fontFamily: F.base, letterSpacing: 1 }}>DEPOIS</Text>
      </View>

      {/* Label ANTES (direita) */}
      <View style={{
        position: 'absolute', bottom: 8, right: 8,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: R.full,
        paddingHorizontal: labelPad.px, paddingVertical: labelPad.py,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
      }} pointerEvents="none">
        <Text style={{ color: C.textPrimary, fontSize: labelSize, fontWeight: '800', fontFamily: F.base, letterSpacing: 1 }}>ANTES</Text>
      </View>

      {/* Hint inicial */}
      {!hinted && (
        <View style={{
          position: 'absolute',
          top: height / 2 + handleSize / 2 + 6,
          left: 0, right: 0, alignItems: 'center',
        }} pointerEvents="none">
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: R.full,
            paddingHorizontal: 12, paddingVertical: 6,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <Ionicons name="swap-horizontal-outline" size={iconSize} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: labelSize + 1, fontWeight: '700', fontFamily: F.base }}>Arraste</Text>
          </View>
        </View>
      )}
    </View>
  );
}
