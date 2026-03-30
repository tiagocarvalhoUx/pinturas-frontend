import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface Service {
  id: string;
  name: string;
  description: string;
  pricePerM2: number;
  color: string;
  icon: string;
  duration: string;
}

interface Props {
  service: Service;
  onPress: () => void;
}

const ICONS: Record<string, string> = {
  home: '🏠',
  building: '🏢',
  layers: '🎨',
  sparkles: '✨',
  droplets: '💧',
  refresh: '🔄',
};

export function ServiceCard({ service, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-4 w-48 rounded-2xl overflow-hidden"
      style={{ backgroundColor: service.color + '15', borderWidth: 1, borderColor: service.color + '30' }}
      activeOpacity={0.8}
    >
      <View className="p-4">
        <Text className="text-3xl mb-2">{ICONS[service.icon] || '🖌️'}</Text>
        <Text className="text-base font-bold text-gray-800 mb-1">{service.name}</Text>
        <Text className="text-xs text-gray-500 mb-3" numberOfLines={2}>{service.description}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold" style={{ color: service.color }}>
            R$ {service.pricePerM2}/m²
          </Text>
          <Text className="text-xs text-gray-400">{service.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
