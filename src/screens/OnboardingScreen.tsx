import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', emoji: '🎨', title: 'Transforme seu Espaço', description: 'Serviços profissionais de pintura para dar vida nova à sua casa com qualidade e cuidado.' },
  { id: '2', emoji: '📸', title: 'Solicite Orçamento Fácil', description: 'Tire fotos do ambiente, descreva o serviço e receba um orçamento detalhado rapidamente.' },
  { id: '3', emoji: '⭐', title: 'Portfólio Profissional', description: 'Veja nossos trabalhos realizados com fotos antes e depois de cada projeto concluído.' },
  { id: '4', emoji: '💬', title: 'Chat Direto', description: 'Comunique-se diretamente com nossa equipe para tirar dúvidas e acompanhar seu serviço.' },
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
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
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
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <Text className="text-8xl mb-8">{item.emoji}</Text>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-4">{item.title}</Text>
            <Text className="text-base text-gray-500 text-center leading-6">{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View className="flex-row justify-center mb-8">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className="h-2 rounded-full mx-1"
            style={{ width: i === current ? 24 : 8, backgroundColor: i === current ? '#2563EB' : '#D1D5DB' }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View className="px-6 pb-12 gap-3">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary-500 rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold">
            {current === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>

        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
            <Text className="text-gray-400 text-base">Pular</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
