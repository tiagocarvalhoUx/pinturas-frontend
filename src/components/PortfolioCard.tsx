import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { PortfolioItem } from '../store/appStore';
import { SERVICE_LABELS } from '../utils/helpers';

interface Props {
  item: PortfolioItem;
  onPress: () => void;
}

export function PortfolioCard({ item, onPress }: Props) {
  const [showAfter, setShowAfter] = useState(true);
  const image = showAfter ? item.afterImage : item.beforeImage;

  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm" activeOpacity={0.9}>
      <View className="relative h-48">
        {image?.url ? (
          <Image source={{ uri: image.url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center">
            <Text className="text-4xl">🖼️</Text>
          </View>
        )}

        {item.beforeImage?.url && item.afterImage?.url && (
          <View className="absolute top-2 right-2 flex-row bg-black/50 rounded-full p-1">
            <TouchableOpacity onPress={() => setShowAfter(false)} className="px-2 py-1 rounded-full" style={{ backgroundColor: !showAfter ? '#fff' : 'transparent' }}>
              <Text className="text-xs font-bold" style={{ color: !showAfter ? '#000' : '#fff' }}>Antes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAfter(true)} className="px-2 py-1 rounded-full" style={{ backgroundColor: showAfter ? '#fff' : 'transparent' }}>
              <Text className="text-xs font-bold" style={{ color: showAfter ? '#000' : '#fff' }}>Depois</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.featured && (
          <View className="absolute top-2 left-2 bg-yellow-400 rounded-full px-2 py-1">
            <Text className="text-xs font-bold text-yellow-900">⭐ Destaque</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-base font-bold text-gray-800 mb-1">{item.title}</Text>
        <Text className="text-sm text-gray-500 mb-2">{SERVICE_LABELS[item.serviceType]}</Text>
        <View className="flex-row gap-4">
          {item.area && <Text className="text-xs text-gray-400">📐 {item.area} m²</Text>}
          {item.duration && <Text className="text-xs text-gray-400">⏱️ {item.duration}</Text>}
          {item.location && <Text className="text-xs text-gray-400">📍 {item.location}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}
