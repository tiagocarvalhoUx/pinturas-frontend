import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
  Animated, PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { C, R, F } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

// ─── Slide 1: Logo neon com glow pulsante ───────────────────────────────────
function SlideOne() {
  const pulse  = useRef(new Animated.Value(0)).current;
  const ring1  = useRef(new Animated.Value(0)).current;
  const ring2  = useRef(new Animated.Value(0)).current;
  const textOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(textOp, { toValue: 1, duration: 900, delay: 400, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(ring2, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOp = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });
  const r1Sc   = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] });
  const r1Op   = ring1.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.55, 0.2, 0] });
  const r2Sc   = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const r2Op   = ring2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.35, 0.12, 0] });

  return (
    <LinearGradient colors={['#000000', '#06000F', '#000000']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient glow blob */}
      <Animated.View style={{
        position: 'absolute',
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: C.amber, opacity: glowOp,
        shadowColor: C.amber, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 80, elevation: 30,
      }} />

      {/* Pulsing rings */}
      <Animated.View style={{
        position: 'absolute', width: 170, height: 170, borderRadius: 85,
        borderWidth: 1.5, borderColor: C.amber,
        transform: [{ scale: r1Sc }], opacity: r1Op,
      }} />
      <Animated.View style={{
        position: 'absolute', width: 170, height: 170, borderRadius: 85,
        borderWidth: 1, borderColor: C.amberLight,
        transform: [{ scale: r2Sc }], opacity: r2Op,
      }} />

      {/* Hexagon-like icon frame */}
      <View style={{
        width: 160, height: 160,
        borderRadius: 28,
        borderWidth: 2, borderColor: C.amber,
        backgroundColor: '#06000F',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: C.amber, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.95, shadowRadius: 28, elevation: 24,
      }}>
        <Ionicons name="brush" size={72} color={C.amber} />
      </View>

      {/* Texts */}
      <Animated.View style={{ alignItems: 'center', marginTop: 40, opacity: textOp }}>
        <Text style={{ color: C.textPrimary, fontSize: 24, fontFamily: F.bold, letterSpacing: 0.6, textAlign: 'center' }}>
          A. Coraça & T. Carvalho
        </Text>
        <Text style={{ color: C.amber, fontSize: 11, letterSpacing: 4, marginTop: 8, fontFamily: F.base, textTransform: 'uppercase' }}>
          Pinturas e Reformas
        </Text>
        <View style={{ width: 44, height: 2.5, backgroundColor: C.amber, borderRadius: 2, marginTop: 18, opacity: 0.85 }} />
        <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 16, fontFamily: F.base, textAlign: 'center', paddingHorizontal: 48, lineHeight: 22 }}>
          Qualidade que transforma ambientes
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ─── Slide 2: Chat animado ───────────────────────────────────────────────────
function SlideTwo() {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(anims[0], { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(anims[1], { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(350),
      Animated.timing(anims[2], { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(anims[3], { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const messages = [
    { text: 'Olá! Quero um orçamento para pintar minha sala.', isUser: true },
    { text: 'Claro! Ficamos felizes em ajudar! 🎨', isUser: false },
    { text: 'Pode nos enviar uma foto do ambiente?', isUser: false },
    { text: 'Vou enviar agora mesmo! 📷', isUser: true },
  ];

  return (
    <LinearGradient colors={['#050010', '#000000']} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: C.border,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: C.amber + '25', alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: C.amber,
        }}>
          <Ionicons name="brush" size={20} color={C.amber} />
        </View>
        <View>
          <Text style={{ color: C.textPrimary, fontFamily: F.bold, fontSize: 15 }}>Serviço de Pintura</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.success }} />
            <Text style={{ color: C.success, fontSize: 11, fontFamily: F.base }}>Online agora</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 10 }}>
        {messages.map((m, i) => (
          <Animated.View key={i} style={{
            opacity: anims[i],
            transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            alignSelf: m.isUser ? 'flex-end' : 'flex-start',
            maxWidth: '78%',
          }}>
            <View style={{
              backgroundColor: m.isUser ? C.amber : '#1A1A2E',
              borderRadius: 18,
              borderBottomRightRadius: m.isUser ? 4 : 18,
              borderBottomLeftRadius: m.isUser ? 18 : 4,
              paddingHorizontal: 16, paddingVertical: 11,
              shadowColor: m.isUser ? C.amber : '#000',
              shadowOpacity: m.isUser ? 0.35 : 0.2,
              shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
            }}>
              <Text style={{ color: '#fff', fontSize: 14, fontFamily: F.base, lineHeight: 20 }}>{m.text}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingBottom: 52, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: C.border,
      }}>
        <View style={{ flex: 1, backgroundColor: '#111125', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.textDisabled, fontFamily: F.base, fontSize: 13 }}>Escreva uma mensagem...</Text>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center', shadowColor: C.amber, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 }}>
          <Ionicons name="send" size={18} color="#fff" />
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Slide 3: Before/After real ─────────────────────────────────────────────
function SlideThree() {
  const [pos, setPos] = useState(0.5);
  const hinted = useRef(false);
  const hint = useRef(new Animated.Value(1)).current;
  const IMG_W = W - 48;
  const IMG_H = 240;

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (!hinted.current) {
          hinted.current = true;
          Animated.timing(hint, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
        setPos(Math.max(0.02, Math.min(e.nativeEvent.locationX / IMG_W, 0.98)));
      },
      onPanResponderMove: (e) => {
        setPos(Math.max(0.02, Math.min(e.nativeEvent.locationX / IMG_W, 0.98)));
      },
    })
  ).current;

  const divX = pos * IMG_W;

  return (
    <LinearGradient colors={['#000000', '#05000D']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.textSecondary, fontSize: 11, letterSpacing: 3.5, fontFamily: F.base, textTransform: 'uppercase', marginBottom: 20 }}>
        Resultados Reais
      </Text>

      {/* Before/After inline */}
      <View style={{ width: IMG_W, height: IMG_H, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: C.amber + '50' }} {...pr.panHandlers}>
        <Image source={require('../image/sala_1_antes.png')} style={{ position: 'absolute', width: IMG_W, height: IMG_H }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 0, left: 0, width: divX, height: IMG_H, overflow: 'hidden' }}>
          <Image source={require('../image/sala_1_depois.png')} style={{ width: IMG_W, height: IMG_H }} resizeMode="cover" />
          <View style={{ position: 'absolute', inset: 0, backgroundColor: C.amber + '08' }} pointerEvents="none" />
        </View>
        {/* Divider */}
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: divX - 1.5, width: 3, backgroundColor: 'rgba(255,255,255,0.9)', shadowColor: C.amber, shadowOpacity: 0.9, shadowRadius: 8 }} pointerEvents="none" />
        {/* Handle */}
        <View style={{ position: 'absolute', top: IMG_H / 2 - 20, left: divX - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.amber + 'BB', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }} pointerEvents="none">
          <Ionicons name="swap-horizontal" size={18} color={C.amber} />
        </View>
        {/* Labels */}
        <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: C.amber + 'DD', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }} pointerEvents="none">
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: F.bold, letterSpacing: 1.5 }}>DEPOIS</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} pointerEvents="none">
          <Text style={{ color: C.textPrimary, fontSize: 10, fontFamily: F.bold, letterSpacing: 1.5 }}>ANTES</Text>
        </View>
        {/* Drag hint */}
        <Animated.View style={{ position: 'absolute', top: IMG_H / 2 + 26, left: 0, right: 0, alignItems: 'center', opacity: hint }} pointerEvents="none">
          <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Ionicons name="swap-horizontal-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: F.base }}>Arraste</Text>
          </View>
        </Animated.View>
      </View>

      <View style={{ marginTop: 28, paddingHorizontal: 40, alignItems: 'center' }}>
        <Text style={{ color: C.textPrimary, fontSize: 22, fontFamily: F.bold, textAlign: 'center' }}>
          Transformação Real
        </Text>
        <Text style={{ color: C.textSecondary, fontSize: 14, fontFamily: F.base, textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
          Veja a diferença que fazemos em cada ambiente com qualidade e dedicação.
        </Text>
      </View>
    </LinearGradient>
  );
}

// ─── Slide 4: Orçamento por foto ─────────────────────────────────────────────
function SlideFour() {
  const shimmer = useRef(new Animated.Value(0)).current;
  const camOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(camOp, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const btnScale = shimmer.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const glowOp   = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const corners = [
    { top: 12, left: 12, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
    { top: 12, right: 12, borderTopWidth: 2.5, borderRightWidth: 2.5 },
    { bottom: 12, left: 12, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
    { bottom: 12, right: 12, borderBottomWidth: 2.5, borderRightWidth: 2.5 },
  ] as const;

  return (
    <LinearGradient colors={['#05000D', '#000000']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

      {/* Camera viewfinder mock */}
      <Animated.View style={{ opacity: camOp }}>
        <View style={{
          width: W - 64, height: 200,
          borderRadius: R.lg,
          borderWidth: 1.5, borderColor: C.amber + '55',
          backgroundColor: '#0A0012',
          overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>
          {corners.map((style, i) => (
            <View key={i} style={{
              position: 'absolute', width: 28, height: 28,
              borderColor: C.amber, ...style,
            }} />
          ))}
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Ionicons name="camera-outline" size={52} color={C.amber + '90'} />
            <Text style={{ color: C.textDisabled, fontSize: 13, fontFamily: F.base }}>
              Posicione a câmera no ambiente
            </Text>
          </View>
          {/* Tab selector mock */}
          <View style={{ position: 'absolute', top: 12, flexDirection: 'row', gap: 4 }}>
            <View style={{ backgroundColor: C.amber, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontFamily: F.bold }}>Parede</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontFamily: F.base }}>Teto</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Text style={{ color: C.textPrimary, fontSize: 23, fontFamily: F.bold, textAlign: 'center', marginBottom: 12 }}>
        Orçamento por Foto
      </Text>
      <Text style={{ color: C.textSecondary, fontSize: 14, fontFamily: F.base, textAlign: 'center', lineHeight: 22, marginBottom: 34 }}>
        Fotografe o ambiente, envie para nossa equipe e receba seu orçamento em até 24 horas.
      </Text>

      {/* Pulsing CTA */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Animated.View style={{
          shadowColor: C.amber, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOp, shadowRadius: 20, elevation: 14,
          borderRadius: R.full,
        }}>
          <View style={{
            backgroundColor: C.amber, borderRadius: R.full,
            paddingHorizontal: 38, paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <Ionicons name="pricetag-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold }}>Solicitar Orçamento</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

// ─── Dados dos slides ─────────────────────────────────────────────────────────
const SLIDES = [
  { id: '1', label: 'Bem-vindo',   accent: C.amber,   component: SlideOne },
  { id: '2', label: 'Chat',        accent: '#5AAAE0',  component: SlideTwo },
  { id: '3', label: 'Portfólio',   accent: C.amberLight, component: SlideThree },
  { id: '4', label: 'Orçamento',   accent: '#4ABA79', component: SlideFour },
];

// ─── Onboarding principal ────────────────────────────────────────────────────
interface Props { onFinish: () => void; }

export function OnboardingScreen({ onFinish }: Props) {
  const [current, setCurrent] = useState(0);
  const setHasSeenOnboarding  = useAppStore((s) => s.setHasSeenOnboarding);

  // Paint-wipe overlay animation
  const wipeX   = useRef(new Animated.Value(-W)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[current];
  const SlideComponent = slide.component;

  const paintWipe = (next: number) => {
    // 1) Wipe in (violet overlay sweeps left → right covering screen)
    Animated.timing(wipeX, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => {
      setCurrent(next);
      // 2) Wipe out (overlay exits to the right, revealing new slide)
      Animated.timing(wipeX, { toValue: W, duration: 260, useNativeDriver: true }).start(() => {
        wipeX.setValue(-W); // reset for next use
      });
    });
  };

  const handleNext = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (current < SLIDES.length - 1) {
      paintWipe(current + 1);
    } else {
      setHasSeenOnboarding(true);
      onFinish();
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    onFinish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Slide content */}
      <View style={{ flex: 1 }}>
        <SlideComponent />
      </View>

      {/* Bottom controls */}
      <View style={{
        backgroundColor: '#06000F',
        borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: 24, paddingBottom: 48, paddingTop: 18,
      }}>
        {/* Dot indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 22, gap: 7 }}>
          {SLIDES.map((_s, i) => (
            <View key={i} style={{
              height: 5, borderRadius: 3,
              width: i === current ? 32 : 7,
              backgroundColor: i === current ? slide.accent : '#2A2A3A',
            }} />
          ))}
        </View>

        {/* Next / Começar button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity onPress={handleNext} activeOpacity={0.88}>
            <LinearGradient
              colors={[C.amberDeep, C.amber, C.amberLight]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                borderRadius: R.md, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                shadowColor: C.amber, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: F.bold, letterSpacing: 0.3 }}>
                {current === SLIDES.length - 1 ? 'Começar Agora' : 'Próximo'}
              </Text>
              <Ionicons
                name={current === SLIDES.length - 1 ? 'rocket-outline' : 'arrow-forward'}
                size={20} color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Skip */}
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Text style={{ color: C.textDisabled, fontSize: 14, fontFamily: F.base }}>Pular introdução</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Paint-wipe overlay — sweeps across as transition */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: W, height: H,
          backgroundColor: C.amber,
          transform: [{ translateX: wipeX }],
          opacity: 0.92,
        }}
      />
    </View>
  );
}
