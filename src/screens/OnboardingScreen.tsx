import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { C, R, F } from '../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'color-palette' as const,
    accent: C.amber,
    accentDim: C.amberDeep,
    tag: 'Bem-vindo',
    title: 'Transforme\nseu Espaço',
    description: 'Serviços profissionais de pintura para dar vida nova à sua casa com qualidade e cuidado.',
    features: ['Pintura interna e externa', 'Texturas e grafiato', 'Laqueação e restauração'],
  },
  {
    id: '2',
    icon: 'document-text' as const,
    accent: '#5AAAE0',
    accentDim: '#2E6FA8',
    tag: 'Orçamento',
    title: 'Solicite\nFacilmente',
    description: 'Tire fotos do ambiente, descreva o serviço e receba um orçamento detalhado rapidamente.',
    features: ['Envie fotos do local', 'Estimativa imediata', 'Resposta em até 24h'],
  },
  {
    id: '3',
    icon: 'images' as const,
    accent: C.terra,
    accentDim: '#8B2F12',
    tag: 'Portfólio',
    title: 'Veja Nossos\nTrabalhos',
    description: 'Confira projetos realizados com fotos antes e depois de cada serviço concluído.',
    features: ['Fotos antes e depois', 'Projetos reais', 'Qualidade comprovada'],
  },
  {
    id: '4',
    icon: 'chatbubbles' as const,
    accent: '#4ABA79',
    accentDim: '#267A4E',
    tag: 'Suporte',
    title: 'Chat\nDireto',
    description: 'Comunique-se diretamente com nossa equipe para tirar dúvidas e acompanhar seu serviço.',
    features: ['Atendimento rápido', 'Acompanhe em tempo real', 'Suporte personalizado'],
  },
];

interface Props {
  onFinish: () => void;
}

export function OnboardingScreen({ onFinish }: Props) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);

  const slide = SLIDES[current];

  const animateTransition = (nextIndex: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    flatRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrent(nextIndex);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      animateTransition(current + 1);
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
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1 }}>
            {/* Top: dark with glowing icon */}
            <View style={{ height: height * 0.52, backgroundColor: C.bgDeep, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>

              {/* Large ambient glow */}
              <View style={{
                position: 'absolute', width: 260, height: 260, borderRadius: 130,
                backgroundColor: item.accent, opacity: 0.06,
              }} />

              {/* Tag pill */}
              <View style={{
                borderWidth: 1, borderColor: item.accent + '55',
                backgroundColor: item.accent + '18',
                borderRadius: R.full, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 32,
              }}>
                <Text style={{ color: item.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', fontFamily: F.base }}>
                  {item.tag}
                </Text>
              </View>

              {/* Icon ring */}
              <View style={{
                width: 110, height: 110, borderRadius: 55,
                borderWidth: 1.5, borderColor: item.accent + '44',
                alignItems: 'center', justifyContent: 'center', marginBottom: 28,
              }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: item.accent + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={item.icon} size={42} color={item.accent} />
                </View>
              </View>

              {/* Title */}
              <Text style={{
                color: C.textPrimary, fontSize: 38, fontWeight: '900',
                textAlign: 'center', lineHeight: 44, letterSpacing: -0.5, fontFamily: F.base,
              }}>
                {item.title}
              </Text>

              {/* Accent rule */}
              <View style={{ width: 36, height: 3, backgroundColor: item.accent, borderRadius: 2, marginTop: 16, opacity: 0.8 }} />
            </View>

            {/* Bottom: dark surface */}
            <View style={{ flex: 1, backgroundColor: C.bgSurface, paddingHorizontal: 28, paddingTop: 28 }}>
              <Text style={{
                fontSize: 15, color: C.textSecondary, textAlign: 'center',
                lineHeight: 23, marginBottom: 24, fontFamily: F.base,
              }}>
                {item.description}
              </Text>

              {/* Features */}
              <View style={{ gap: 12 }}>
                {item.features.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 30, height: 30, borderRadius: 10,
                      backgroundColor: item.accent + '20',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons name="checkmark" size={16} color={item.accent} />
                    </View>
                    <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '600', fontFamily: F.base }}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={{
        backgroundColor: C.bgSurface,
        borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: 24, paddingBottom: 44, paddingTop: 16,
      }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 6 }}>
          {SLIDES.map((s, i) => (
            <View key={i} style={{
              height: 5, borderRadius: 3,
              width: i === current ? 28 : 7,
              backgroundColor: i === current ? slide.accent : C.bgMuted,
            }} />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[slide.accentDim, slide.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              borderRadius: R.md, paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 }}>
              {current === SLIDES.length - 1 ? 'Começar Agora' : 'Próximo'}
            </Text>
            <Ionicons
              name={current === SLIDES.length - 1 ? 'rocket-outline' : 'arrow-forward'}
              size={20} color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Text style={{ color: C.textDisabled, fontSize: 14, fontWeight: '600' }}>Pular introdução</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
