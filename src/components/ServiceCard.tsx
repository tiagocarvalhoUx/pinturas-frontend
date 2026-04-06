import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { C, R } from '../theme';

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
  home: '🏠', building: '🏢', layers: '🎨',
  sparkles: '✨', droplets: '💧', refresh: '🔄',
};

export function ServiceCard({ service, onPress }: Props) {
  // Remap light palette colors to dark-friendly ones
  const accentColor = C.amber;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginRight: 14, width: 180,
        backgroundColor: C.bgSurface,
        borderRadius: R.lg, overflow: 'hidden',
        borderWidth: 1.5, borderColor: accentColor + '30',
      }}
    >
      {/* Top accent line */}
      <View style={{ height: 3, backgroundColor: accentColor, opacity: 0.8 }} />

      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 32, marginBottom: 10 }}>{ICONS[service.icon] || '🖌️'}</Text>
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
          {service.name}
        </Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 12, lineHeight: 16 }} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: accentColor }}>
            R$ {service.pricePerM2}/m²
          </Text>
          <Text style={{ fontSize: 11, color: C.textDisabled }}>{service.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
