import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'color-palette',
    iconColor: '#2563EB',
    bg: ['#1d4ed8', '#2563EB', '#3b82f6'] as const,
    tag: 'Bem-vindo',
    title: 'Transforme\nseu Espaço',
    description: 'Serviços profissionais de pintura para dar vida nova à sua casa com qualidade e cuidado.',
    features: ['Pintura interna e externa', 'Texturas e grafiato', 'Laqueação e restauração'],
  },
  {
    id: '2',
    icon: 'document-text',
    iconColor: '#7c3aed',
    bg: ['#5b21b6', '#7c3aed', '#8b5cf6'] as const,
    tag: 'Orçamento',
    title: 'Solicite\nFacilmente',
    description: 'Tire fotos do ambiente, descreva o serviço e receba um orçamento detalhado rapidamente.',
    features: ['Envie fotos do local', 'Estimativa imediata', 'Resposta em até 24h'],
  },
  {
    id: '3',
    icon: 'images',
    iconColor: '#d97706',
    bg: ['#b45309', '#d97706', '#f59e0b'] as const,
    tag: 'Portfólio',
    title: 'Veja Nossos\nTrabalhos',
    description: 'Confira projetos realizados com fotos antes e depois de cada serviço concluído.',
    features: ['Fotos antes e depois', 'Projetos reais', 'Qualidade comprovada'],
  },
  {
    id: '4',
    icon: 'chatbubbles',
    iconColor: '#059669',
    bg: ['#065f46', '#059669', '#10b981'] as const,
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
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    } else {
      setHasSeenOnboarding(true);
      onFinish();
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    onFinish();
  };

  const slide = SLIDES[current];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ width }}>
            {/* Top gradient section */}
            <LinearGradient colors={item.bg} style={{ height: height * 0.55, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
              {/* Tag */}
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 28 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>{item.tag.toUpperCase()}</Text>
              </View>

              {/* Icon circle */}
              <View style={{
                width: 120, height: 120, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 28,
                shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20,
              }}>
                <View style={{ width: 90, height: 90, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={item.icon as any} size={48} color="#fff" />
                </View>
              </View>

              {/* Title */}
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', textAlign: 'center', lineHeight: 42 }}>
                {item.title}
              </Text>
            </LinearGradient>

            {/* Bottom content */}
            <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 28 }}>
              <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
                {item.description}
              </Text>

              {/* Features */}
              <View style={{ gap: 10 }}>
                {item.features.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: item.bg[1] + '18', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="checkmark" size={16} color={item.bg[1]} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#374151', fontWeight: '600' }}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={{ backgroundColor: '#fff', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              height: 6, borderRadius: 3,
              width: i === current ? 28 : 8,
              backgroundColor: i === current ? slide.bg[1] : '#e2e8f0',
            }} />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={slide.bg}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              {current === SLIDES.length - 1 ? 'Começar Agora' : 'Próximo'}
            </Text>
            <Ionicons name={current === SLIDES.length - 1 ? 'rocket-outline' : 'arrow-forward'} size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '600' }}>Pular introdução</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
